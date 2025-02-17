
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import yandexRoutes from './routes/yandexRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Расширяем настройки CORS
app.use(cors({
  origin: '*', // Временно разрешаем запросы с любого домена для отладки
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Добавляем обработку OPTIONS запросов
app.options('*', cors());

// Добавляем расширенное логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(express.json());
app.use('/api/yandex', yandexRoutes);

// Проверяем наличие SSL сертификатов
const sslPath = '/etc/letsencrypt/live/allynovaittest.site/';
if (fs.existsSync(sslPath)) {
  try {
    const httpsOptions = {
      key: fs.readFileSync(`${sslPath}privkey.pem`),
      cert: fs.readFileSync(`${sslPath}fullchain.pem`)
    };

    // Создаем HTTPS сервер
    https.createServer(httpsOptions, app).listen(port, () => {
      console.log(`HTTPS Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting HTTPS server:', error);
    // Если возникла ошибка при запуске HTTPS, запускаем HTTP
    app.listen(port, '0.0.0.0', () => {
      console.log(`HTTP Server running on port ${port} (HTTPS failed to start)`);
    });
  }
} else {
  // Если сертификатов нет, запускаем HTTP сервер на всех интерфейсах
  app.listen(port, '0.0.0.0', () => {
    console.log(`HTTP Server running on port ${port} (No SSL certificates found)`);
  });
}
