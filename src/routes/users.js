import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await users.findMany();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
