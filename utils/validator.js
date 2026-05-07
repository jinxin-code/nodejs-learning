/**
 * 验证工具模块 - 提供输入验证功能
 */

/**
 * 验证邮箱格式
 * @param {string} email - 待验证的邮箱地址
 * @returns {boolean} - 是否为有效邮箱
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证用户名格式（只允许字母、数字、下划线）
 * @param {string} username - 待验证的用户名
 * @returns {boolean} - 是否为有效用户名
 */
function validateUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

/**
 * 验证用户数据
 * @param {object} userData - 用户数据对象
 * @param {number} maxNameLength - 姓名最大长度
 * @param {number} maxUsernameLength - 用户名最大长度
 * @param {number} maxEmailLength - 邮箱最大长度
 * @returns {string[]} - 错误信息数组（空数组表示验证通过）
 */
function validateUserData(userData, maxNameLength = 100, maxUsernameLength = 50, maxEmailLength = 255) {
  const errors = [];
  
  // 验证姓名
  if (!userData.name || typeof userData.name !== 'string') {
    errors.push('姓名是必填字段');
  } else if (userData.name.trim().length === 0) {
    errors.push('姓名不能为空');
  } else if (userData.name.length > maxNameLength) {
    errors.push(`姓名长度不能超过 ${maxNameLength} 个字符`);
  }
  
  // 验证用户名
  if (!userData.username || typeof userData.username !== 'string') {
    errors.push('用户名是必填字段');
  } else if (userData.username.trim().length === 0) {
    errors.push('用户名不能为空');
  } else if (userData.username.length > maxUsernameLength) {
    errors.push(`用户名长度不能超过 ${maxUsernameLength} 个字符`);
  } else if (!validateUsername(userData.username)) {
    errors.push('用户名只能包含字母、数字和下划线');
  }
  
  // 验证邮箱
  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('邮箱是必填字段');
  } else if (userData.email.trim().length === 0) {
    errors.push('邮箱不能为空');
  } else if (userData.email.length > maxEmailLength) {
    errors.push(`邮箱长度不能超过 ${maxEmailLength} 个字符`);
  } else if (!validateEmail(userData.email)) {
    errors.push('邮箱格式无效');
  }
  
  return errors;
}

module.exports = {
  validateEmail,
  validateUsername,
  validateUserData
};