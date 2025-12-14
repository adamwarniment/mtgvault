import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import authRoutes from './routes/authRoutes';
import binderRoutes from './routes/binderRoutes';
import searchRoutes from './routes/searchRoutes';
import userRoutes from './routes/userRoutes';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/binders', binderRoutes);
app.use('/scryfall', searchRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('MTG Vault API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
