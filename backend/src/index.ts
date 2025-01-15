import express from 'express';
import cors from 'cors';
import yandexRoutes from './routes/yandexRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Настраиваем CORS для разрешения запросов с фронтенда
app.use(cors({
  origin: ['https://c92a790c-17b3-472d-8332-9fc086e78627.lovableproject.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/yandex', yandexRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});