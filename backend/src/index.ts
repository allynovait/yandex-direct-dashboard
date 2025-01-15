import express from 'express';
import cors from 'cors';
import yandexRoutes from './routes/yandexRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Настраиваем CORS для разрешения запросов с фронтенда
app.use(cors({
  origin: [
    'https://c92a790c-17b3-472d-8332-9fc086e78627.lovableproject.com',
    'http://localhost:5173', // для локальной разработки
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Добавляем логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());
app.use('/api/yandex', yandexRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});