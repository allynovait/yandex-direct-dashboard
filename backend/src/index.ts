import express from 'express';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
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

// Проверяем наличие SSL сертификатов
const sslPath = '/etc/letsencrypt/live/89.223.70.180/';
if (fs.existsSync(sslPath)) {
  const httpsOptions = {
    key: fs.readFileSync(`${sslPath}privkey.pem`),
    cert: fs.readFileSync(`${sslPath}fullchain.pem`)
  };

  // Создаем HTTPS сервер
  https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
  });
} else {
  // Если сертификатов нет, запускаем HTTP сервер
  app.listen(port, () => {
    console.log(`HTTP Server running on port ${port}`);
  });
}