
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import yandexRoutes from './routes/yandexRoutes';

const app = express();
const port = process.env.PORT || 3000;

// Расширяем настройки CORS для поддержки всех доменов
app.use(cors({
  origin: '*',  // Разрешаем запросы с любого домена
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Обработка preflight запросов OPTIONS
app.options('*', cors());

// Добавляем расширенное логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  // Явно добавляем CORS заголовки для всех ответов
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
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
