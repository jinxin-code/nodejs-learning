/**
 * User Management System - Native Node.js Server
 * 
 * 使用纯原生 Node.js HTTP 模块实现的 RESTful API 服务器
 * 没有使用任何第三方框架，适合学习 Node.js 底层原理
 * 
 * 核心特性：
 * - 手动解析 HTTP 请求和响应
 * - 手动处理路由
 * - 手动处理静态文件
 * - 手动实现 CORS
 */

// 引入核心模块
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// 引入自定义模块
const config = require('./config');
const userService = require('./services/userService');
const validator = require('./utils/validator');

// 静态文件扩展名对应的 MIME 类型
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * 设置 CORS 响应头
 * @param {http.ServerResponse} res - 响应对象
 * @param {string} origin - 请求来源
 */
function setCorsHeaders(res, origin) {
  // 检查是否为允许的来源
  const allowedOrigins = config.cors.allowedOrigins;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时缓存预检请求
}

/**
 * 处理 OPTIONS 预检请求
 * @param {http.ServerResponse} res - 响应对象
 */
function handleOptionsRequest(res) {
  res.writeHead(204, { 'Content-Length': '0' });
  res.end();
}

/**
 * 发送 JSON 响应
 * @param {http.ServerResponse} res - 响应对象
 * @param {number} statusCode - HTTP 状态码
 * @param {object} data - 响应数据
 */
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(data))
  });
  res.end(JSON.stringify(data));
}

/**
 * 处理静态文件请求
 * @param {http.IncomingMessage} req - 请求对象
 * @param {http.ServerResponse} res - 响应对象
 * @returns {Promise<boolean>} - 是否成功处理
 */
async function handleStaticFile(req, res) {
  // 获取请求路径，默认为 index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(__dirname, 'public', filePath);
  
  try {
    // 读取文件内容
    const content = await fs.readFile(fullPath);
    
    // 获取文件扩展名
    const ext = path.extname(filePath);
    
    // 设置响应头
    const headers = {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': `public, max-age=${config.cache.staticFilesMaxAge}`
    };
    
    res.writeHead(200, headers);
    res.end(content);
    return true;
  } catch (error) {
    // 文件不存在或读取失败
    return false;
  }
}

/**
 * 解析请求体
 * @param {http.IncomingMessage} req - 请求对象
 * @returns {Promise<object>} - 解析后的请求体
 */
async function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = [];
    
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        resolve({});
      }
    });
  });
}

/**
 * 处理 API 请求
 * @param {http.IncomingMessage} req - 请求对象
 * @param {http.ServerResponse} res - 响应对象
 */
async function handleApiRequest(req, res) {
  const { method, url } = req;
  const origin = req.headers.origin || '';
  
  // 设置 CORS 响应头
  setCorsHeaders(res, origin);
  
  // 处理 OPTIONS 预检请求
  if (method === 'OPTIONS') {
    handleOptionsRequest(res);
    return;
  }
  
  // 解析 URL
  const basePath = config.api.basePath;
  
  // GET /api/users - 获取所有用户
  if (method === 'GET' && url === `${basePath}/users`) {
    const users = userService.getAllUsers();
    sendJsonResponse(res, 200, users);
    return;
  }
  
  // GET /api/users/:id - 获取单个用户
  const singleUserMatch = url.match(/^\/api\/users\/(\d+)$/);
  if (method === 'GET' && singleUserMatch) {
    const userId = singleUserMatch[1];
    const user = userService.getUserById(userId);
    
    if (!user) {
      sendJsonResponse(res, 404, { error: '用户不存在' });
      return;
    }
    
    sendJsonResponse(res, 200, user);
    return;
  }
  
  // POST /api/users - 创建新用户
  if (method === 'POST' && url === `${basePath}/users`) {
    const body = await parseRequestBody(req);
    
    // 验证输入
    const errors = validator.validateUserData(
      body,
      config.validation.maxNameLength,
      config.validation.maxUsernameLength,
      config.validation.maxEmailLength
    );
    
    if (errors.length > 0) {
      sendJsonResponse(res, 400, { error: errors.join('; ') });
      return;
    }
    
    const newUser = userService.createUser(body);
    sendJsonResponse(res, 201, newUser);
    return;
  }
  
  // PUT /api/users/:id - 更新用户
  if (method === 'PUT' && singleUserMatch) {
    const userId = singleUserMatch[1];
    const body = await parseRequestBody(req);
    
    // 验证输入
    const errors = validator.validateUserData(
      body,
      config.validation.maxNameLength,
      config.validation.maxUsernameLength,
      config.validation.maxEmailLength
    );
    
    if (errors.length > 0) {
      sendJsonResponse(res, 400, { error: errors.join('; ') });
      return;
    }
    
    const updatedUser = userService.updateUser(userId, body);
    
    if (!updatedUser) {
      sendJsonResponse(res, 404, { error: '用户不存在' });
      return;
    }
    
    sendJsonResponse(res, 200, updatedUser);
    return;
  }
  
  // DELETE /api/users/:id - 删除用户
  if (method === 'DELETE' && singleUserMatch) {
    const userId = singleUserMatch[1];
    const success = userService.deleteUser(userId);
    
    if (!success) {
      sendJsonResponse(res, 404, { error: '用户不存在' });
      return;
    }
    
    sendJsonResponse(res, 200, { message: '用户删除成功' });
    return;
  }
  
  // 未知路由
  sendJsonResponse(res, 404, { error: 'API 端点不存在' });
}

/**
 * 主请求处理函数
 * @param {http.IncomingMessage} req - 请求对象
 * @param {http.ServerResponse} res - 响应对象
 */
async function handleRequest(req, res) {
  try {
    // 检查是否为 API 请求
    if (req.url.startsWith(config.api.basePath)) {
      await handleApiRequest(req, res);
      return;
    }
    
    // 尝试处理静态文件
    const staticHandled = await handleStaticFile(req, res);
    if (staticHandled) {
      return;
    }
    
    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  } catch (error) {
    console.error('Request handling error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器内部错误' }));
  }
}

/**
 * 启动服务器
 */
async function startServer() {
  // 初始化用户数据
  await userService.fetchUsersFromAPI();
  
  // 创建 HTTP 服务器
  const server = http.createServer(handleRequest);
  
  // 监听端口
  server.listen(config.server.port, config.server.host, () => {
    console.log(`Native Node.js Server running on http://${config.server.host}:${config.server.port}`);
  });
  
  // 处理服务器错误
  server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

// 启动服务器
startServer();