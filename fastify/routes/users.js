/**
 * ============================================
 * 用户管理路由模块 (User Routes Module)
 * ============================================
 * 
 * 【架构师视角 - 路由层设计原则】
 * 1. 单一职责：路由文件只负责定义 API 端点
 * 2. 业务逻辑分离：复杂逻辑委托给 service 层
 * 3. 输入验证：使用 Schema 确保数据完整性
 * 4. 统一响应：使用装饰器生成标准响应格式
 * 
 * 【Fastify 路由插件模式】
 * 路由模块导出一个异步函数，接收 fastify 实例和配置选项
 * 这种模式允许：
 * - 路由复用（在不同前缀下注册）
 * - 配置注入（传递数据库连接等）
 * - 独立作用域（避免装饰器污染）
 * 
 * 【RESTful API 设计】
 * 本模块遵循 RESTful 设计规范：
 * - GET /users      → 获取列表
 * - GET /users/:id  → 获取单个资源
 * - POST /users     → 创建资源
 * - PUT /users/:id  → 更新资源
 * - DELETE /users/:id → 删除资源
 */

const userService = require('../services/userService')

// ============================================
// Schema 定义
// ============================================
// 【JSON Schema 验证】
// Fastify 使用 JSON Schema 自动验证请求数据
// 验证失败会自动返回 400 Bad Request
// 
// 【Schema 类型】
// - body: 请求体验证（POST/PUT）
// - querystring: URL 查询参数验证
// - params: 路径参数验证
// - response: 响应格式验证

/**
 * 用户创建/更新的请求体验证 Schema
 * 
 * 【Schema 关键字说明】
 * - type: 数据类型
 * - required: 必填字段
 * - properties: 字段定义
 * - minLength/maxLength: 字符串长度限制
 * - format: 预定义格式（email, uri, date-time 等）
 * - enum: 枚举值
 */
const userSchema = {
  type: 'object',
  required: ['name', 'username', 'email'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    username: { type: 'string', minLength: 1, maxLength: 50 },
    email: { type: 'string', format: 'email' }
  }
}

/**
 * 用户列表查询参数验证 Schema
 * 
 * 【查询参数说明】
 * - search: 搜索关键词（可选）
 * - filterType: 筛选类型（可选，枚举值）
 * - filterValue: 筛选值（可选）
 */
const userListQuerySchema = {
  type: 'object',
  properties: {
    search: { type: 'string', maxLength: 100 },
    filterType: { type: 'string', enum: ['username', 'email'] },
    filterValue: { type: 'string', maxLength: 100 }
  }
}

/**
 * 用户 ID 路径参数验证 Schema
 * 
 * 【路径参数验证】
 * 确保传入的 ID 是有效的正整数
 */
const userIdParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'integer', minimum: 1 }
  }
}

/**
 * 用户响应验证 Schema
 * 
 * 【响应验证的作用】
 * 1. 确保 API 返回的数据格式一致
 * 2. 自动过滤掉未定义的字段
 * 3. 提高响应序列化性能
 */
const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    address: { type: 'object' },
    phone: { type: 'string' },
    website: { type: 'string' },
    company: { type: 'object' }
  }
}

const userListResponseSchema = {
  type: 'array',
  items: userResponseSchema
}

// ============================================
// 路由定义
// ============================================

/**
 * 用户路由插件
 * 
 * @param {FastifyInstance} fastify - Fastify 实例
 * @param {Object} options - 配置选项
 * 
 * 【插件函数签名】
 * async (fastify, options) => {}
 * - fastify: 当前作用域的 Fastify 实例
 * - options: 注册时传入的配置
 */
async function userRoutes(fastify, options) {
  /**
   * GET / - 获取用户列表
   * 
   * 【API 设计】
   * - 支持搜索：?search=关键词
   * - 支持筛选：?filterType=username&filterValue=Bret
   * 
   * 【Schema 配置】
   * - querystring: 验证查询参数
   * - response: 验证响应格式
   */
  fastify.get('/', {
    schema: {
      querystring: userListQuerySchema,
      response: {
        200: userListResponseSchema
      },
      // OpenAPI 文档信息（用于 Swagger）
      summary: '获取用户列表',
      description: '获取所有用户，支持搜索和筛选'
    }
  }, async (request) => {
    // 从查询参数构建筛选条件
    const filters = {
      search: request.query.search || null,
      filterType: request.query.filterType || null,
      filterValue: request.query.filterValue || null
    }
    
    // 调用服务层获取数据
    const users = userService.getUsersWithFilters(filters)
    
    // 使用装饰器生成统一响应格式
    return fastify.generateResponse(users, 'Users fetched successfully')
  })

  /**
   * GET /:id - 获取单个用户详情
   * 
   * 【路径参数】
   * :id 会被解析到 request.params.id
   * 
   * 【错误处理】
   * - ID 无效：抛出 Error，由全局错误处理器处理
   * - 用户不存在：设置 404 状态码后抛出错误
   */
  fastify.get('/:id', {
    schema: {
      params: userIdParamSchema,
      response: {
        200: userResponseSchema,
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      },
      summary: '获取用户详情',
      description: '根据用户ID获取单个用户的详细信息'
    }
  }, async (request, reply) => {
    // 解析路径参数
    const userId = parseInt(request.params.id)
    
    // 参数验证（双重保险，Schema 已经验证过）
    if (isNaN(userId)) {
      throw new Error('Invalid user ID')
    }
    
    // 调用服务层获取用户
    const user = userService.getUserById(userId)
    
    // 用户不存在处理
    if (!user) {
      reply.status(404)  // 设置状态码
      throw new Error('User not found')
    }
    
    return fastify.generateResponse(user, 'User fetched successfully')
  })

  /**
   * POST / - 创建新用户
   * 
   * 【请求体验证】
   * Schema 会自动验证 request.body
   * 验证失败返回 400 Bad Request
   * 
   * 【HTTP 状态码】
   * 创建成功返回 201 Created
   */
  fastify.post('/', {
    schema: {
      body: userSchema,
      response: {
        201: userResponseSchema
      },
      summary: '创建新用户',
      description: '创建一个新的用户账户'
    }
  }, async (request, reply) => {
    // request.body 已通过 Schema 验证
    const newUser = userService.createUser(request.body)
    
    // 设置 201 状态码
    reply.status(201)
    
    return fastify.generateResponse(newUser, 'User created successfully')
  })

  /**
   * PUT /:id - 更新用户信息
   * 
   * 【部分更新 vs 完整更新】
   * PUT 通常用于完整更新
   * 部分更新应使用 PATCH
   * 
   * 【Schema 注意】
   * 更新时字段都是可选的（没有 required）
   */
  fastify.put('/:id', {
    schema: {
      params: userIdParamSchema,
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          username: { type: 'string', minLength: 1, maxLength: 50 },
          email: { type: 'string', format: 'email' }
        }
      },
      response: {
        200: userResponseSchema
      },
      summary: '更新用户信息',
      description: '更新指定用户的信息'
    }
  }, async (request, reply) => {
    const userId = parseInt(request.params.id)
    
    if (isNaN(userId)) {
      throw new Error('Invalid user ID')
    }
    
    // 调用服务层更新用户
    const updatedUser = userService.updateUser(userId, request.body)
    
    if (!updatedUser) {
      reply.status(404)
      throw new Error('User not found')
    }
    
    return fastify.generateResponse(updatedUser, 'User updated successfully')
  })

  /**
   * DELETE /:id - 删除用户
   * 
   * 【删除操作最佳实践】
   * 1. 返回被删除的资源（便于客户端确认）
   * 2. 资源不存在时返回 404
   * 3. 生产环境应考虑软删除
   */
  fastify.delete('/:id', {
    schema: {
      params: userIdParamSchema,
      summary: '删除用户',
      description: '根据用户ID删除指定用户'
    }
  }, async (request, reply) => {
    const userId = parseInt(request.params.id)
    
    if (isNaN(userId)) {
      throw new Error('Invalid user ID')
    }
    
    // 调用服务层删除用户
    const deletedUser = userService.deleteUser(userId)
    
    if (!deletedUser) {
      reply.status(404)
      throw new Error('User not found')
    }
    
    return fastify.generateResponse(deletedUser, 'User deleted successfully')
  })
}

// 导出路由插件
module.exports = userRoutes
