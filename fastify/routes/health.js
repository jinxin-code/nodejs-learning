/**
 * ============================================
 * 健康检查路由模块 (Health Check Routes)
 * ============================================
 * 
 * 【架构师视角 - 健康检查的重要性】
 * 健康检查是微服务和容器化部署的基础设施：
 * 1. 负载均衡器通过健康检查决定流量分发
 * 2. Kubernetes 使用健康检查进行 Pod 重启
 * 3. 监控系统通过健康检查判断服务状态
 * 
 * 【健康检查设计原则】
 * 1. 轻量级：响应要快，不能消耗太多资源
 * 2. 可靠性：不应因外部依赖失败而返回不健康
 * 3. 信息量：返回足够的状态信息便于排查问题
 * 
 * 【生产环境建议】
 * - 添加数据库连接检查
 * - 添加缓存服务检查
 * - 添加关键依赖检查
 * - 返回服务版本信息
 */

/**
 * 健康检查路由插件
 * 
 * @param {FastifyInstance} fastify - Fastify 实例
 * @param {Object} options - 配置选项
 */
async function healthRoutes(fastify, options) {
  /**
   * GET / - 健康检查端点
   * 
   * 【响应字段说明】
   * - status: 服务状态（ok/error）
   * - timestamp: 检查时间
   * - uptime: 服务运行时间（秒）
   * 
   * 【扩展建议】
   * 生产环境可添加：
   * - version: 服务版本号
   * - dependencies: 依赖服务状态
   * - memory: 内存使用情况
   * - cpu: CPU 使用情况
   */
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' }
          }
        }
      },
      summary: '健康检查',
      description: '检查服务是否正常运行'
    }
  }, async () => {
    return {
      status: 'ok',
      timestamp: fastify.getCurrentTimestamp(),
      uptime: process.uptime()  // Node.js 进程运行时间（秒）
    }
  })
}

module.exports = healthRoutes
