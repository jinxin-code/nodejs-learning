/**
 * 用户数据存储模块 - 提供用户数据的增删改查操作
 * 所有服务器版本共享此模块，避免重复代码
 */

const config = require('../config');

// 内存数据存储
let users = [];
let nextId = 1;

/**
 * 从外部 API 获取初始用户数据
 * @returns {Promise<void>}
 */
async function fetchUsersFromAPI() {
  try {
    const response = await fetch(config.api.externalUsersUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 只保留需要的字段
    users = data.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email
    }));
    
    // 更新下一个可用 ID
    nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    console.log(`Successfully fetched ${users.length} users from API`);
  } catch (error) {
    console.error('Failed to fetch users from API:', error.message);
    // 如果获取失败，使用默认测试数据
    initializeDefaultUsers();
  }
}

/**
 * 初始化默认测试用户（当外部 API 不可用时）
 */
function initializeDefaultUsers() {
  users = [
    { id: 1, name: '张三', username: 'zhangsan', email: 'zhang@example.com' },
    { id: 2, name: '李四', username: 'lisi', email: 'li@example.com' },
    { id: 3, name: '王五', username: 'wangwu', email: 'wang@example.com' },
    { id: 4, name: '赵六', username: 'zhaoliu', email: 'zhao@example.com' },
    { id: 5, name: '钱七', username: 'qianqi', email: 'qian@example.com' }
  ];
  nextId = 6;
  console.log('Using default test users');
}

/**
 * 获取所有用户
 * @returns {object[]} - 用户数组
 */
function getAllUsers() {
  return [...users]; // 返回副本，防止直接修改
}

/**
 * 根据 ID 获取用户
 * @param {number} id - 用户 ID
 * @returns {object|undefined} - 用户对象或 undefined
 */
function getUserById(id) {
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return undefined;
  }
  return users.find(user => user.id === userId);
}

/**
 * 创建新用户
 * @param {object} userData - 用户数据
 * @returns {object} - 创建的用户对象
 */
function createUser(userData) {
  const newUser = {
    id: nextId++,
    name: userData.name,
    username: userData.username,
    email: userData.email
  };
  
  users.push(newUser);
  return { ...newUser }; // 返回副本
}

/**
 * 更新用户信息
 * @param {number} id - 用户 ID
 * @param {object} userData - 更新的用户数据
 * @returns {object|undefined} - 更新后的用户对象或 undefined
 */
function updateUser(id, userData) {
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return undefined;
  }
  
  const index = users.findIndex(user => user.id === userId);
  if (index === -1) {
    return undefined;
  }
  
  users[index] = {
    ...users[index],
    name: userData.name,
    username: userData.username,
    email: userData.email
  };
  
  return { ...users[index] }; // 返回副本
}

/**
 * 删除用户
 * @param {number} id - 用户 ID
 * @returns {boolean} - 是否删除成功
 */
function deleteUser(id) {
  const userId = parseInt(id);
  if (isNaN(userId)) {
    return false;
  }
  
  const index = users.findIndex(user => user.id === userId);
  if (index === -1) {
    return false;
  }
  
  users.splice(index, 1);
  return true;
}

module.exports = {
  fetchUsersFromAPI,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};