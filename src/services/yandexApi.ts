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
          Format: "JSON",
          IncludeVAT: "YES",
          IncludeDiscount: "YES"
        }
      };

      const response = await fetch("https://api.direct.yandex.ru/live/v4/json/", {
        method: "POST",
        headers: {
          "Authorization": `OAuth ${this.token}`,
          "Accept-Language": "ru",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Преобразуем данные в нужный формат
      return data.data.map((account: any) => ({
        accountId: account.AccountID || "",
        accountName: account.AccountName || "Неизвестный аккаунт",
        clicks: parseInt(account.Clicks) || 0,
        impressions: parseInt(account.Impressions) || 0,
        ctr: parseFloat(account.Ctr) || 0,
        spend: parseFloat(account.Cost) || 0,
        conversions: parseInt(account.Conversions) || 0,
        balance: 0 // Баланс получаем отдельным запросом, если потребуется
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }
}