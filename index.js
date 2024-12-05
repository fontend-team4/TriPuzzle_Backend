import express from 'express';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import usersRouter from './src/routes/users.js';
import authRoutes from './src/routes/auth.js';
import './src/configs/passport.js';
dotenv.config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
