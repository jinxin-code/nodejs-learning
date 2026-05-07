/**
 * User Management System - Express Server
 * 
 * 使用 Express 框架实现的 RESTful API 服务器
 * Express 是 Node.js 最流行的 Web 框架，提供了很多便捷的功能
 * 
 * 核心特性：
 * - 内置路由系统
 * - 中间件机制
 * - 静态文件服务
 * - JSON 解析中间件
 */

// 引入依赖
const express = require('express');

// 引入自定义模块
const config = require('./config');
const userService = require('./services/userService');
const validator = require('./utils/validator');

// 创建 Express 应用
const app = express();

/**
 * 配置中间件
 */

// 解析 JSON 请求体
app.use(express.json({
  limit: '10kb' // 限制请求体大小
}));

// 静态文件服务
app.use(express.static('public', {
  maxAge: `${config.cache.staticFilesMaxAge}s`,
  etag: false // 禁用 ETag 以减少请求
}));

// CORS 中间件
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  
  // 检查是否为允许的来源
  if (config.cors.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

/**
 * 定义 API 路由
 */

// GET /api/users - 获取所有用户
app.get(`${config.api.basePath}/users`, (req, res) => {
  const users = userService.getAllUsers();
  res.json(users);
});

// GET /api/users/:id - 获取单个用户
app.get(`${config.api.basePath}/users/:id`, (req, res) => {
  const user = userService.getUserById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json(user);
});

// POST /api/users - 创建新用户
app.post(`${config.api.basePath}/users`, (req, res) => {
  // 验证输入
  const errors = validator.validateUserData(
    req.body,
    config.validation.maxNameLength,
    config.validation.maxUsernameLength,
    config.validation.maxEmailLength
  );
  
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }
  
  const newUser = userService.createUser(req.body);
  res.status(201).json(newUser);
});

// PUT /api/users/:id - 更新用户
app.put(`${config.api.basePath}/users/:id`, (req, res) => {
  // 验证输入
  const errors = validator.validateUserData(
    req.body,
    config.validation.maxNameLength,
    config.validation.maxUsernameLength,
    config.validation.maxEmailLength
  );
  
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }
  
  const updatedUser = userService.updateUser(req.params.id, req.body);
  
  if (!updatedUser) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json(updatedUser);
});

// DELETE /api/users/:id - 删除用户
app.delete(`${config.api.basePath}/users/:id`, (req, res) => {
  const success = userService.deleteUser(req.params.id);
  
  if (!success) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json({ message: '用户删除成功' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'API 端点不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

/**
 * 启动服务器
 */
async function startServer() {
  // 初始化用户数据
  await userService.fetchUsersFromAPI();
  
  // 监听端口
  app.listen(config.server.port, config.server.host, () => {
    console.log(`Express Server running on http://${config.server.host}:${config.server.port}`);
  });
}

// 启动服务器
startServer();