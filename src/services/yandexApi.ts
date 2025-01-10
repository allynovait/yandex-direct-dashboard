import { YandexStats, DateRange } from "@/types/yandex";

const YANDEX_API_URL = "https://api.direct.yandex.com/json/v5/";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(method: string, params: any) {
    console.log(`Making request to ${method}`, params);
    
    const response = await fetch(`${YANDEX_API_URL}${method}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Accept-Language": "ru",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: params.method || "get",
        params: params.params || params
      }),
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
    return this.makeRequest("reports", {
      method: "get",
      params: {
        SelectionCriteria: {
          DateFrom: dateRange.from.toISOString().split("T")[0],
          DateTo: dateRange.to.toISOString().split("T")[0],
        },
        FieldNames: [
          "AccountName",
          "AccountId",
          "Impressions",
          "Clicks",
          "Ctr",
          "Cost",
          "Conversions",
          "AccountBalance"
        ],
        ReportName: "Статистика по аккаунтам",
        ReportType: "ACCOUNT_PERFORMANCE_REPORT",
        DateRangeType: "CUSTOM_DATE",
        Format: "JSON",
        IncludeVAT: "YES",
        IncludeDiscount: "YES"
      }
    }).then(response => {
      // Transform API response to match our YandexStats type
      return response.data.map((account: any) => ({
        accountId: account.AccountId,
        accountName: account.AccountName,
        conversions: account.Conversions || 0,
        spend: account.Cost / 1000000, // Convert from microseconds to rubles
        clicks: account.Clicks,
        impressions: account.Impressions,
        balance: account.AccountBalance / 1000000, // Convert from microseconds to rubles
        ctr: parseFloat(account.Ctr)
      }));
    });
  }
}