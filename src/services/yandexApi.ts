import { YandexStats, DateRange } from "@/types/yandex";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange) {
    try {
      console.log("Making request to Yandex.Direct API");
      
      const requestBody = {
        method: "get",
        params: {
          SelectionCriteria: {
            DateFrom: dateRange.from.toISOString().split("T")[0],
            DateTo: dateRange.to.toISOString().split("T")[0]
          },
          FieldNames: [
            "Impressions",
            "Clicks",
            "Ctr",
            "Cost",
            "Conversions"
          ],
          ReportName: "Account Performance Report",
          ReportType: "ACCOUNT_PERFORMANCE_REPORT",
          DateRangeType: "CUSTOM_DATE",
          Format: "TSV",
          IncludeVAT: "YES",
          IncludeDiscount: "YES"
        }
      };

      const response = await fetch("https://api.direct.yandex.com/json/v5/reports", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept-Language": "ru",
          "Content-Type": "application/json; charset=utf-8",
          "processingMode": "auto",
          "returnMoneyInMicros": "false",
          "skipReportHeader": "true",
          "skipColumnHeader": "true",
          "skipReportSummary": "true"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${errorText}`);
        throw new Error(`Yandex Direct API error: ${response.statusText}`);
      }

      const data = await response.text();
      console.log("Raw API response:", data);

      // Разбираем TSV ответ
      const rows = data.trim().split("\n");
      return rows.map(row => {
        const [impressions, clicks, ctr, cost, conversions] = row.split("\t");
        return {
          accountId: "direct",
          accountName: "Яндекс.Директ",
          clicks: parseInt(clicks) || 0,
          impressions: parseInt(impressions) || 0,
          ctr: parseFloat(ctr) || 0,
          spend: parseFloat(cost) || 0,
          conversions: parseInt(conversions) || 0,
          balance: 0 // Баланс получаем отдельным запросом, если потребуется
        };
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }
}