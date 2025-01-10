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
        "Content-Type": "application/json; charset=utf-8",
        "Client-Login": params.login || "",
        "Use-Operator-Units": "true"
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
    const requestBody = {
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
        Format: "TSV",
        IncludeVAT: "YES",
        IncludeDiscount: "YES"
      }
    };

    try {
      const response = await fetch("https://api.direct.yandex.com/v5/reports", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept-Language": "ru",
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
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }

      const data = await response.text();
      console.log("Raw API response:", data);

      // Parse TSV data
      const rows = data.trim().split("\n");
      return rows.map(row => {
        const [accountName, accountId, impressions, clicks, ctr, cost, conversions, balance] = row.split("\t");
        return {
          accountId,
          accountName,
          conversions: parseInt(conversions) || 0,
          spend: parseFloat(cost) || 0,
          clicks: parseInt(clicks) || 0,
          impressions: parseInt(impressions) || 0,
          balance: parseFloat(balance) || 0,
          ctr: parseFloat(ctr) || 0
        };
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  }
}