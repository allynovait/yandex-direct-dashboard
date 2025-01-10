import express from 'express';
import cors from 'cors';
import yandexRoutes from './routes/yandexRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://preview--yandex-direct-dashboard.lovable.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api/yandex', yandexRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});