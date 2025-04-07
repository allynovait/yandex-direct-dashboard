
import { Request, Response } from 'express';
import { YandexService } from '../services/yandexService';
import { AxiosError } from 'axios';

export const getStats = async (req: Request, res: Response) => {
  try {
    console.log('Received stats request with body:', req.body);
    
    const { token, dateRange, conversionIds } = req.body;
    if (!token || !dateRange) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: { token: !!token, dateRange: !!dateRange }
      });
    }

    const yandexService = new YandexService(token);
    const stats = await yandexService.getStats(dateRange, conversionIds);
    res.json(stats);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error in getStats controller:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch stats',
        details: error.response?.data || error.message
      });
    } else {
      const err = error as Error;
      console.error('Unexpected error in getStats controller:', err.message);
      res.status(500).json({ 
        error: 'Internal server error',
        details: err.message
      });
    }
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
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error in getAccounts controller:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch accounts',
        details: error.response?.data || error.message
      });
    } else {
      const err = error as Error;
      console.error('Unexpected error in getAccounts controller:', err.message);
      res.status(500).json({ 
        error: 'Internal server error',
        details: err.message
      });
    }
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    console.log('Received status check request');
    
    const yandexService = new YandexService('dummy-token');
    const status = await yandexService.getStatus();
    
    res.json(status);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in getStatus controller:', err.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message
    });
  }
};
