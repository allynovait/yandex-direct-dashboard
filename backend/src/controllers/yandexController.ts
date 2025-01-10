import { Request, Response } from 'express';
import { YandexService } from '../services/yandexService';

export const getStats = async (req: Request, res: Response) => {
  try {
    const { token, dateRange } = req.body;
    const yandexService = new YandexService(token);
    const stats = await yandexService.getStats(dateRange);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const yandexService = new YandexService(token);
    const accounts = await yandexService.getAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};