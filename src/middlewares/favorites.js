const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const authMiddleware = {
  async authenticate(req, res, next) {
    try {
      // 從 header 取得 token
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        return res.status(401).json({ 
          message: '未提供驗證 Token', 
          error: true 
        })
      }

      // 驗證 Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // 檢查使用者是否存在
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        return res.status(401).json({ 
          message: '無效的使用者', 
          error: true 
        })
      }

      // 將使用者資訊掛載到 request 物件
      req.user = user
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token 已過期', 
          error: true 
        })
      }

      res.status(401).json({ 
        message: '驗證失敗', 
        error: true 
      })
    }
  }
}

module.exports = authMiddleware