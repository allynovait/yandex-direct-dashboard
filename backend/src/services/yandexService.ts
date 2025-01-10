import axios from 'axios';
import { DateRange } from '../types/yandex';

export class YandexService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange) {
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

    return response.data;
  }

  async getAccounts() {
    const response = await axios.get('https://api.direct.yandex.com/json/v5/accounts', {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept-Language': 'ru'
      }
    });

    return response.data;
  }
}