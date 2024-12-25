import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const verifyOwner = (model) => async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resourceId = parseInt(req.params.id, 10); // 從 URL 中取得資源 ID

    if (isNaN(resourceId)) {
      return res.status(400).json({ message: "無效的資源 ID" });
    }

    // 查詢資源是否由本人建立
    const resource = await prisma[model].findFirst({
      where: {
        id: resourceId,
      },
    });

    if (!resource) {
      return res.status(404).json({ message: "資源不存在" });
    }

    // 確認是否為建立者或共編者
    const isOwner = resource.create_by === userId;

    const isEditor = await prisma.users_schedules.findUnique({
      where: {
        schedule_id_user_id: {
          schedule_id: resourceId,
          user_id: userId,
        },
      },
    });

    if (!isOwner && (!isEditor || !isEditor.access)) {
      return res.status(403).json({ message: "您無權操作此資源" });
    }

    req.resource = resource; // 將資源附加到 req，方便後續使用
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { verifyOwner };
