export interface YandexAccount {
  id: string;
  login: string;
  name: string;
}

export interface YandexStats {
  conversions: number;
  spend: number;
  clicks: number;
  impressions: number;
  balance: number;
  ctr: number;
}

export interface YandexSettings {
  conversionIds: string[];
}