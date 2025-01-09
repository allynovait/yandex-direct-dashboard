import { YandexStats, DateRange } from "@/types/yandex";

const YANDEX_API_URL = "https://api.direct.yandex.com/json/v5/";

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(method: string, params: any) {
    const response = await fetch(`${YANDEX_API_URL}${method}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Accept-Language": "ru",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Yandex Direct API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getAccounts() {
    return this.makeRequest("accounts", {
      method: "get",
    });
  }

  async getStats(dateRange: DateRange) {
    return this.makeRequest("reports", {
      params: {
        SelectionCriteria: {
          DateFrom: dateRange.from.toISOString().split("T")[0],
          DateTo: dateRange.to.toISOString().split("T")[0],
        },
        FieldNames: [
          "CampaignId",
          "Impressions",
          "Clicks",
          "Ctr",
          "Cost",
          "Conversions",
        ],
        ReportName: "Статистика по аккаунтам",
        ReportType: "ACCOUNT_PERFORMANCE_REPORT",
        DateRangeType: "CUSTOM_DATE",
        Format: "TSV",
        IncludeVAT: "YES",
        IncludeDiscount: "YES",
      },
    });
  }
}