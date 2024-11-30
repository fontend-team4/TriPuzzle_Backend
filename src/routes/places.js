const express = require('express')
const router = express.Router()
const prisma = require('../configs/db')


router.get('/', async (req, res) => {
    try {
      const rows = await prisma.places.findMany()
      res.json(rows)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  

  module.exports = router