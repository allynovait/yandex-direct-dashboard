import express from 'express';
import cors from 'cors';
import yandexRoutes from './routes/yandexRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());  // Разрешаем все origins для локальной разработки

app.use(express.json());
app.use('/api/yandex', yandexRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});