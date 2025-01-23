import { Request, Response } from 'express';
import { YandexService } from '../services/yandexService';
import { AxiosError } from 'axios';

export const getStats = async (req: Request, res: Response) => {
  try {
    console.log('Received stats request with body:', req.body);
    
    const { token, dateRange } = req.body;
    if (!token || !dateRange) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: { token: !!token, dateRange: !!dateRange }
      });
    }

    const yandexService = new YandexService(token);
    const stats = await yandexService.getStats(dateRange);
    res.json(stats);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error in getStats controller:', axiosError.response?.data || axiosError.message);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: axiosError.response?.data || axiosError.message
    });
  }
};

export const getAccounts = async (req: Request, res: Response) => {
  try {
    console.log('Received accounts request');
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const yandexService = new YandexService(token);
    const accounts = await yandexService.getAccounts();
    res.json(accounts);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error in getAccounts controller:', axiosError.response?.data || axiosError.message);
    res.status(500).json({ 
      error: 'Failed to fetch accounts',
      details: axiosError.response?.data || axiosError.message
    });
  }
};