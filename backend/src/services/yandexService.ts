import axios from 'axios';
import { DateRange } from '../types/yandex';

export class YandexService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange) {
    try {
      console.log('Making request to Yandex.Direct API with params:', {
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        token: this.token.slice(-8)
      });

      // Форматируем даты в формат YYYY-MM-DD
      const dateFrom = new Date(dateRange.from).toISOString().split('T')[0];
      const dateTo = new Date(dateRange.to).toISOString().split('T')[0];

      const response = await axios.post(
        'https://api.direct.yandex.com/json/v5/reports',
        {
          SelectionCriteria: {
            DateFrom: dateFrom,
            DateTo: dateTo
          },
          FieldNames: [
            "Clicks",
            "Impressions",
            "Ctr",
            "Cost",
            "Conversions"
          ],
          ReportName: `Report ${Date.now()}`,
          ReportType: "ACCOUNT_PERFORMANCE_REPORT",
          DateRangeType: "CUSTOM_DATE",
          Format: "TSV",
          IncludeVAT: "YES"
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept-Language': 'ru',
            'Content-Type': 'application/json',
            'processingMode': 'auto',
            'returnMoneyInMicros': 'false',
            'skipReportHeader': 'true',
            'skipColumnHeader': 'true',
            'skipReportSummary': 'true'
          }
        }
      );

      console.log('Yandex.Direct API response:', response.data);
      
      // Парсим TSV ответ
      const [metrics = "0\t0\t0\t0\t0"] = response.data.split('\n');
      const [clicks, impressions, ctr, cost, conversions] = metrics.split('\t').map(Number);

      return {
        result: {
          data: [{
            metrics: [{
              Clicks: clicks,
              Impressions: impressions,
              Ctr: ctr,
              Cost: cost,
              Conversions: conversions
            }]
          }]
        }
      };
    } catch (error) {
      console.error('Error in YandexService.getStats:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAccounts() {
    try {
      console.log('Making request to Yandex.Direct API for accounts');
      
      const response = await axios.get('https://api.direct.yandex.com/json/v5/accounts', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept-Language': 'ru',
          'Content-Type': 'application/json'
        }
      });

      console.log('Yandex.Direct API accounts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in YandexService.getAccounts:', error.response?.data || error.message);
      throw error;
    }
  }
}