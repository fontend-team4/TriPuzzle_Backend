
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const verifyOwner = (model) => async (req, res, next) => {
    try {
      const userId = req.user.id; 
      const resourceId = parseInt(req.params.id); // 從 URL 中取得資源 ID
  
      // 確認是否是本人
      const resource = await prisma[model].findFirst({
        where: {
          id: resourceId,
          create_by: userId,
        },
      });
  
      if (!resource) {
        return res.status(403).json({ message: "您無權操作此資源" });
      }
  
      req.resource = resource; // 將資源附加到 req，方便後續使用
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

  export { verifyOwner };