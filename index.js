import express from 'express';
import cors from 'cors';
import usersRouter from './src/routes/users.js';
import schedulePlacesRoutes from './src/routes/schedulePlaces.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.use(express.json());
app.use('/users', usersRouter);
app.use('/api/schedulePlaces', schedulePlacesRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});