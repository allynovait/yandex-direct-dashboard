import { YandexStats, DateRange } from "@/types/yandex";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange): Promise<YandexStats> {
    try {
      console.log("Making request to Yandex.Direct API");
      
      const response = await fetch("https://api.direct.yandex.ru/live/v4/json/", {
        method: "POST",
        headers: {
          "Authorization": `OAuth ${this.token}`,
          "Accept-Language": "ru",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "GetSummaryStat",
          param: {
            DateFrom: dateRange.from.toISOString().split("T")[0],
            DateTo: dateRange.to.toISOString().split("T")[0],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      return {
        accountId: this.token.slice(-8), // Используем часть токена как ID
        accountName: `Аккаунт ${this.token.slice(-8)}`,
        clicks: data.data.Clicks || 0,
        impressions: data.data.Impressions || 0,
        ctr: data.data.Ctr || 0,
        spend: data.data.Sum || 0,
        conversions: data.data.Conversions || 0,
        balance: 0
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }
}

export async function getAllAccountsStats(dateRange: DateRange): Promise<YandexStats[]> {
  const tokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
  const results = await Promise.all(
    tokens.map(async (token: string) => {
      try {
        const api = new YandexDirectAPI(token);
        return await api.getStats(dateRange);
      } catch (error) {
        console.error(`Error fetching stats for token ${token}:`, error);
        return null;
      }
    })
  );
  return results.filter((result): result is YandexStats => result !== null);
}