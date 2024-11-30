const express = require('express')
const app = express()
const cors = require('cors')
const usersRouter = require('./src/routes/users')
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


const PORT = 3000
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})