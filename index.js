const express = require('express')
const app = express()
const cors = require('cors')
const usersRouter = require('./src/routes/users')
const schedulesRouter = require('./src/routes/schedules')
const router = express.Router()

app.use(cors({
    origin: 'http://localhost:5173',
    method: ['GET', 'POST', 'PUT', 'DELETE']
  }))


  app.get('/', (req, res) => {
    res.send('Welcome to the API!')
  })

app.use(express.json())
app.use('/users', usersRouter)
app.use('/schedules', schedulesRouter)


const PORT = 3000
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})