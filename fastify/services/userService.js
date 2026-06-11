/**
 * ============================================
 * 用户服务模块 (User Service Module)
 * ============================================
 * 
 * 【架构师视角 - 服务层设计原则】
 * 服务层是业务逻辑的核心，应该：
 * 1. 单一职责：只处理用户相关的业务逻辑
 * 2. 数据访问抽象：隐藏数据存储细节
 * 3. 可测试性：纯函数设计，便于单元测试
 * 4. 可替换性：数据源可替换（内存 → 数据库）
 * 
 * 【分层架构中的位置】
 * ┌─────────────────────────────────────────────────────────┐
 * │                    Route Layer                          │
 * │              (routes/users.js)                          │
 * │              处理 HTTP 请求/响应                         │
 * ├─────────────────────────────────────────────────────────┤
 * │                  Service Layer  ← 本文件                │
 * │            (services/userService.js)                    │
 * │              业务逻辑处理                                │
 * ├─────────────────────────────────────────────────────────┤
 * │                  Data Layer                             │
 * │              (内存/数据库)                               │
 * │              数据持久化                                  │
 * └─────────────────────────────────────────────────────────┘
 * 
 * 【当前实现】
 * 本模块使用内存存储，适合演示和学习
 * 生产环境应替换为数据库（PostgreSQL/MongoDB）
 */

// ============================================
// 数据存储
// ============================================
// 【内存存储说明】
// 使用模块级变量存储数据
// 优点：简单、快速
// 缺点：重启后数据丢失、不支持分布式
let users = []

// ============================================
// 公共方法
// ============================================

/**
 * 初始化用户数据
 * 
 * 【使用场景】
 * 服务器启动时从外部 API 获取初始数据
 * 
 * 【数据隔离】
 * 使用展开运算符 [...initialUsers] 创建新数组
 * 避免外部引用修改内部数据
 * 
 * @param {Array} initialUsers - 初始用户数据数组
 */
function initUsers(initialUsers) {
  users = [...initialUsers]
}

/**
 * 获取所有用户
 * 
 * 【防御性编程】
 * 返回数组的副本，而不是原数组引用
 * 防止外部代码意外修改内部数据
 * 
 * @returns {Array} 用户列表的副本
 */
function getAllUsers() {
  return [...users]
}

/**
 * 根据条件筛选用户
 * 
 * 【函数设计】
 * - 参数解构：提高可读性
 * - 纯函数：不修改原数组
 * - 链式调用：代码简洁
 * 
 * 【性能考虑】
 * 小数据量使用 filter 没问题
 * 大数据量应考虑索引或数据库查询
 * 
 * @param {Object} filters - 筛选条件
 * @param {string} filters.search - 搜索关键词（匹配姓名或用户名）
 * @param {string} filters.filterType - 筛选类型 (username/email)
 * @param {string} filters.filterValue - 筛选值
 * @returns {Array} 筛选后的用户列表
 */
function getUsersWithFilters({ search, filterType, filterValue }) {
  // 创建副本，避免修改原数组
  let filteredUsers = [...users]
  
  // 搜索过滤（不区分大小写）
  if (search) {
    const searchLower = search.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    )
  }
  
  // 类型筛选
  if (filterType && filterValue) {
    const filterLower = filterValue.toLowerCase()
    if (filterType === 'username') {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().startsWith(filterLower)
      )
    } else if (filterType === 'email') {
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().startsWith(filterLower)
      )
    }
  }
  
  return filteredUsers
}

/**
 * 根据 ID 获取用户
 * 
 * 【返回值设计】
 * 找到返回用户对象，未找到返回 null
 * 不返回 undefined，因为 null 更明确表示"无值"
 * 
 * @param {number} userId - 用户 ID
 * @returns {Object|null} 用户对象或 null
 */
function getUserById(userId) {
  return users.find(u => u.id === userId) || null
}

/**
 * 创建新用户
 * 
 * 【ID 生成策略】
 * 当前使用自增 ID：取最大 ID + 1
 * 生产环境应使用 UUID 或数据库自增 ID
 * 
 * 【数据完整性】
 * 为可选字段提供默认值，避免 undefined
 * 
 * @param {Object} userData - 用户数据
 * @param {string} userData.name - 姓名
 * @param {string} userData.username - 用户名
 * @param {string} userData.email - 邮箱
 * @returns {Object} 新创建的用户
 */
function createUser(userData) {
  // 生成新 ID
  const newUserId = users.length > 0 
    ? Math.max(...users.map(u => u.id)) + 1 
    : 1
  
  // 构建完整用户对象
  const newUser = {
    id: newUserId,
    ...userData,  // 展开用户数据
    // 为可选字段提供默认值
    address: { city: '' },
    phone: '',
    website: '',
    company: { name: '' }
  }
  
  // 添加到存储
  users.push(newUser)
  
  return newUser
}

/**
 * 更新用户信息
 * 
 * 【更新策略】
 * 使用展开运算符合并数据
 * 保留原有字段，只更新传入的字段
 * 
 * 【不可变性】
 * 创建新对象而不是修改原对象
 * 便于追踪变化和实现撤销功能
 * 
 * @param {number} userId - 用户 ID
 * @param {Object} userData - 更新的用户数据
 * @returns {Object|null} 更新后的用户或 null
 */
function updateUser(userId, userData) {
  const index = users.findIndex(u => u.id === userId)
  
  if (index === -1) return null
  
  // 合并数据（保留原有字段，更新传入字段）
  users[index] = { ...users[index], ...userData }
  
  return users[index]
}

/**
 * 删除用户
 * 
 * 【删除策略】
 * 当前使用物理删除（从数组移除）
 * 生产环境建议使用软删除（设置 deleted 标志）
 * 
 * 【返回值】
 * 返回被删除的用户对象，便于：
 * - 客户端确认删除了什么
 * - 实现撤销功能
 * - 记录审计日志
 * 
 * @param {number} userId - 用户 ID
 * @returns {Object|null} 被删除的用户或 null
 */
function deleteUser(userId) {
  const index = users.findIndex(u => u.id === userId)
  
  if (index === -1) return null
  
  // splice 返回被删除的元素数组
  return users.splice(index, 1)[0]
}

// ============================================
// 模块导出
// ============================================
// 【导出设计】
// 只导出公共方法，隐藏内部实现
// 这是"模块模式"的应用
module.exports = {
  initUsers,
  getAllUsers,
  getUsersWithFilters,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}
