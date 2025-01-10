export interface DateRange {
  from: string;
  to: string;
}

export interface YandexStats {
  accountId: string;
  accountName: string;
  conversions: number;
  spend: number;
  clicks: number;
  impressions: number;
  balance: number;
  ctr: number;
}

export interface YandexAccount {
  Amount: number;
  Login: string;
  AccountId: string;
}