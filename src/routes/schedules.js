const express = require('express')
const router = express.Router()
const prisma = require('../configs/db')
import { authenticate } from "../middlewares/auth"

router.get('/', authenticate ,async (req, res) => {
    try {
      const rows = await prisma.schedules.findMany()
      res.json(rows)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  



// 建立新行程
//目前缺create_by驗證
router.post('/', authenticate ,async (req, res) => {
    try {
      const {
        title,
        create_by,
        co_edit_url,
        co_edit_qrcode,
        schedule_note,
        img_url,
        start_date,
        end_date,
      } = req.body;
  
      await prisma.schedules.create({
        data: {
          title,
          create_by,
          co_edit_url,
          co_edit_qrcode,
          schedule_note,
          img_url,
          start_date,
          end_date,
        },
      });
  
      res.status(201).json({ message: '成功建立新行程' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

  module.exports = router