import express from 'express';
import prisma from '../configs/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rows = await prisma.users.findMany();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
