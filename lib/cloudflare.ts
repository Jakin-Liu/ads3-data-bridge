

// 常量配置
const Constant = {
  CLOUDFLARE: {
    ACCOUNT_ID: process.env.CLOUDFLARE_ACCTOUNT_ID || '',
    API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || ''
  }
} as const

export class CloudflareQueueService {
  private readonly accountId: string
  private readonly apiToken: string

  constructor() {
    // 从环境变量获取 Cloudflare 配置
    this.accountId = Constant.CLOUDFLARE.ACCOUNT_ID
    this.apiToken = Constant.CLOUDFLARE.API_TOKEN
  }

  /**
   * 发送消息到 Cloudflare 队列
   */
  async sendToQueue(
    queueId: string,
    message: any,
    delay: number = 0
  ): Promise<void> {
    try {
      if (!this.accountId || !this.apiToken) {
        console.error('Cloudflare 配置缺失，请检查环境变量')
        return
      }

      const body = {
        body: message,
        content_type: 'json'
      } as any

      if (delay > 0) {
        body.delay_seconds = delay
      }
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/queues/${queueId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Cloudflare 队列发送失败: ${response.status} ${errorText}`
        )
      }

      const result = await response.json()

      console.log('Cloudflare 队列发送成功', {
        queueId,
        messageId: result.result?.id,
        timestamp: Date.now()
      })
    } catch (error: any) {
      console.error('Cloudflare 队列发送失败', error)
      throw error
    }
  }
}

// 导出单例实例
export const cloudflareQueue = new CloudflareQueueService()

// 导出便捷函数
export const sendToQueue = (queueId: string, message: any, delay?: number) => 
  cloudflareQueue.sendToQueue(queueId, message, delay)
