/**
 * User Management System - Koa.js Server
 * 
 * 使用 Koa.js 框架实现的 RESTful API 服务器
 * Koa 是由 Express 原班人马打造的下一代 Node.js Web 框架
 * 使用 async/await 语法，更加现代化和优雅
 * 
 * 核心特性：
 * - 原生 async/await 支持
 * - Context 对象统一管理请求/响应
 * - 极简主义设计（只提供核心功能）
 * - 通过中间件扩展功能
 */

// 引入 Koa 和相关中间件
const Koa = require('koa');
const Router = require('@koa/router');
const { koaBody } = require('koa-body');
const serve = require('koa-static');
const path = require('path');

// 引入自定义模块
const config = require('./config');
const userService = require('./services/userService');
const validator = require('./utils/validator');

// 创建 Koa 应用实例
const app = new Koa();
const router = new Router();

/**
 * 配置中间件
 */

// koa-body - 解析请求体（限制大小）
app.use(koaBody({
  formLimit: '10kb',
  jsonLimit: '10kb'
}));

// koa-static - 提供静态文件服务
app.use(serve(path.join(__dirname, 'public'), {
  maxAge: config.cache.staticFilesMaxAge * 1000, // 转换为毫秒
  etag: false
}));

// CORS 中间件
app.use(async (ctx, next) => {
  const origin = ctx.headers.origin || '';
  
  // 检查是否为允许的来源
  if (config.cors.allowedOrigins.includes(origin)) {
    ctx.set('Access-Control-Allow-Origin', origin);
  }
  
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type');
  ctx.set('Access-Control-Max-Age', '86400');
  
  // 处理 OPTIONS 预检请求
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  
  await next();
});

/**
 * 定义路由
 */

// GET /api/users - 获取所有用户
router.get(`${config.api.basePath}/users`, async (ctx) => {
  const users = userService.getAllUsers();
  ctx.body = users;
});

// GET /api/users/:id - 获取单个用户
router.get(`${config.api.basePath}/users/:id`, async (ctx) => {
  const user = userService.getUserById(ctx.params.id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: '用户不存在' };
    return;
  }
  
  ctx.body = user;
});

// POST /api/users - 创建新用户
router.post(`${config.api.basePath}/users`, async (ctx) => {
  // 验证输入
  const errors = validator.validateUserData(
    ctx.request.body,
    config.validation.maxNameLength,
    config.validation.maxUsernameLength,
    config.validation.maxEmailLength
  );
  
  if (errors.length > 0) {
    ctx.status = 400;
    ctx.body = { error: errors.join('; ') };
    return;
  }
  
  const newUser = userService.createUser(ctx.request.body);
  ctx.status = 201;
  ctx.body = newUser;
});

// PUT /api/users/:id - 更新用户
router.put(`${config.api.basePath}/users/:id`, async (ctx) => {
  // 验证输入
  const errors = validator.validateUserData(
    ctx.request.body,
    config.validation.maxNameLength,
    config.validation.maxUsernameLength,
    config.validation.maxEmailLength
  );
  
  if (errors.length > 0) {
    ctx.status = 400;
    ctx.body = { error: errors.join('; ') };
    return;
  }
  
  const updatedUser = userService.updateUser(ctx.params.id, ctx.request.body);
  
  if (!updatedUser) {
    ctx.status = 404;
    ctx.body = { error: '用户不存在' };
    return;
  }
  
  ctx.body = updatedUser;
});

// DELETE /api/users/:id - 删除用户
router.delete(`${config.api.basePath}/users/:id`, async (ctx) => {
  const success = userService.deleteUser(ctx.params.id);
  
  if (!success) {
    ctx.status = 404;
    ctx.body = { error: '用户不存在' };
    return;
  }
  
  ctx.body = { message: '用户删除成功' };
});

// 将路由中间件添加到应用
app.use(router.routes());
app.use(router.allowedMethods());

// 404 处理
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = { error: 'API 端点不存在' };
});

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Server error:', error);
    ctx.status = 500;
    ctx.body = { error: '服务器内部错误' };
  }
});

/**
 * 启动服务器
 */
async function startServer() {
  // 初始化用户数据
  await userService.fetchUsersFromAPI();
  
  app.listen(config.server.port, config.server.host, () => {
    console.log(`Koa.js Server running on http://${config.server.host}:${config.server.port}`);
  });
}

startServer();