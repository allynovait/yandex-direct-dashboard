
import { YandexStats, DateRange } from "@/types/yandex";

// API URL without protocol to adapt based on the current page protocol
const API_BASE = 'allynovaittest.site:3000/api/yandex';
// Dynamically determine if we should use HTTP or HTTPS based on the current page
const API_URL = (window.location.protocol === 'https:' ? 'https://' : 'http://') + API_BASE;

export class YandexDirectAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getStats(dateRange: DateRange): Promise<YandexStats> {
    try {
      console.log("Making request to backend with token:", this.token.slice(-8));
      console.log("Date range:", dateRange);
      console.log("API URL:", API_URL);
      
      const response = await fetch(`${API_URL}/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify({ token: this.token, dateRange })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Backend error response:", errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);
      
      // Get balance with a separate request
      let balance = 0; // Initialize balance properly
      try {
        const balanceResponse = await fetch(`${API_URL}/accounts`, {
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        });

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          console.log("Balance response:", balanceData);
          balance = balanceData.result?.accounts?.[0]?.Amount || 0;
        } else {
          console.error("Failed to fetch balance:", await balanceResponse.text());
        }
      } catch (balanceError) {
        console.error("Error fetching balance:", balanceError);
        // Continue with zero balance
      }

      // Extract data from the report
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
