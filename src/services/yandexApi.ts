import { YandexStats, DateRange } from "@/types/yandex";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange): Promise<YandexStats> {
    try {
      console.log("Making direct request to Yandex.Direct API with token:", this.token.slice(-8));
      
      const response = await fetch("https://api.direct.yandex.com/json/v5/reports", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept-Language": "ru",
          "Content-Type": "application/json",
          "processingMode": "auto",
          "returnMoneyInMicros": "false",
          "skipReportHeader": "true",
          "skipColumnHeader": "true",
          "skipReportSummary": "true",
          "Origin": "https://preview--yandex-direct-dashboard.lovable.app"
        },
        body: JSON.stringify({
          params: {
            SelectionCriteria: {
              DateFrom: dateRange.from.toISOString().split("T")[0],
              DateTo: dateRange.to.toISOString().split("T")[0]
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
        })
      });

      if (!response.ok) {
        console.error("API error response:", await response.text());
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Получаем баланс отдельным запросом
      const balanceResponse = await fetch("https://api.direct.yandex.com/json/v5/accounts", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept-Language": "ru",
          "Origin": "https://preview--yandex-direct-dashboard.lovable.app"
        }
      });

      let balance = 0;
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        balance = balanceData.result?.accounts?.[0]?.Amount || 0;
      }

      // Извлекаем данные из отчета
      const report = data.result?.data?.[0] || {};
      const metrics = report.metrics?.[0] || {};

      return {
        accountId: this.token.slice(-8),
        accountName: `Аккаунт ${this.token.slice(-8)}`,
        clicks: metrics.Clicks || 0,
        impressions: metrics.Impressions || 0,
        ctr: metrics.Ctr || 0,
        spend: metrics.Cost || 0,
        conversions: metrics.Conversions || 0,
        balance: balance
      };
    } catch (error) {
      console.error("Error fetching stats for token", this.token.slice(-8), ":", error);
      throw error;
    }
  }
}

export async function getAllAccountsStats(dateRange: DateRange): Promise<YandexStats[]> {
  const tokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
  console.log("Found tokens:", tokens.length);
  
  if (tokens.length === 0) {
    console.log("No tokens found in localStorage");
    return [];
  }

  const results = await Promise.all(
    tokens.map(async (token: string) => {
      try {
        const api = new YandexDirectAPI(token);
        return await api.getStats(dateRange);
      } catch (error) {
        console.error(`Error fetching stats for token ${token.slice(-8)}:`, error);
        return null;
      }
    })
  );

  const validResults = results.filter((result): result is YandexStats => result !== null);
  console.log("Valid results:", validResults.length);
  return validResults;
}