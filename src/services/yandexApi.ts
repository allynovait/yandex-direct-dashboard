import { YandexStats, DateRange } from "@/types/yandex";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange): Promise<YandexStats> {
    try {
      console.log("Making request to Yandex.Direct API with token:", this.token.slice(-8));
      
      const response = await fetch("https://api.direct.yandex.ru/live/v4/json/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept-Language": "ru",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "GetSummaryStat",
          param: {
            DateFrom: dateRange.from.toISOString().split("T")[0],
            DateTo: dateRange.to.toISOString().split("T")[0],
          },
          token: this.token
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Проверяем наличие данных в ответе
      if (!data.data) {
        throw new Error("No data in API response");
      }

      return {
        accountId: this.token.slice(-8),
        accountName: `Аккаунт ${this.token.slice(-8)}`,
        clicks: data.data.Clicks || 0,
        impressions: data.data.Impressions || 0,
        ctr: data.data.Ctr || 0,
        spend: data.data.Sum || 0,
        conversions: data.data.Conversions || 0,
        balance: data.data.Balance || 0
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