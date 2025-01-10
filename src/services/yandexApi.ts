import { YandexStats, DateRange } from "@/types/yandex";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(method: string, params: any) {
    console.log(`Making request to ${method}`, params);
    
    const response = await fetch(`https://api-metrika.yandex.net/management/v1/direct/${method}`, {
      method: "POST",
      headers: {
        "Authorization": `OAuth ${this.token}`,
        "Accept-Language": "ru",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(params),
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${errorText}`);
      throw new Error(`Yandex Direct API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    return data;
  }

  async getAccounts() {
    return this.makeRequest("accounts", {
      method: "get",
    });
  }

  async getStats(dateRange: DateRange) {
    try {
      const response = await fetch("https://api-metrika.yandex.net/management/v1/direct/statistics", {
        method: "POST",
        headers: {
          "Authorization": `OAuth ${this.token}`,
          "Accept-Language": "ru",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date1: dateRange.from.toISOString().split("T")[0],
          date2: dateRange.to.toISOString().split("T")[0],
          metrics: "clicks,impressions,ctr,costs,conversions",
          dimensions: "directAccounts"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      return data.data.map((account: any) => ({
        accountId: account.dimensions[0].id,
        accountName: account.dimensions[0].name,
        clicks: account.metrics[0] || 0,
        impressions: account.metrics[1] || 0,
        ctr: account.metrics[2] || 0,
        spend: account.metrics[3] || 0,
        conversions: account.metrics[4] || 0,
        balance: 0 // К сожалению, баланс недоступен через этот API
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }
}