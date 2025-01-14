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

      const response = await axios.post(
        'https://api.direct.yandex.com/json/v5/reports',
        {
          params: {
            SelectionCriteria: {
              DateFrom: dateRange.from,
              DateTo: dateRange.to
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
            Format: "JSON",
            IncludeVAT: "YES"
          }
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
      return response.data;
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