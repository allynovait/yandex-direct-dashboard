
export interface YandexAccount {
  id: string;
  login: string;
  name: string;
}

export interface YandexStats {
  accountId: string;
  accountName: string;
  conversions: number;
  spend: number;
  clicks: number;
  impressions: number;
  balance: number | string;
  ctr: number;
  conversionGoals?: ConversionGoal[];
  demographics?: DemographicData;
  devices?: DeviceData;
}

export interface ConversionGoal {
  id: string;
  name: string;
  conversions: number;
  conversionRate: number;
}

export interface DemographicData {
  gender: {
    male: number;
    female: number;
    unknown: number;
  };
  age: {
    under18: number;
    age18to24: number;
    age25to34: number;
    age35to44: number;
    age45to54: number;
    age55plus: number;
    unknown: number;
  };
}

export interface DeviceData {
  os: {
    [key: string]: number;
  };
  browser: {
    [key: string]: number;
  };
  deviceType: {
    desktop: number;
    mobile: number;
    tablet: number;
    other: number;
  };
}

export interface YandexSettings {
  conversionIds: string[];
}

export type DateRange = {
  from: Date;
  to: Date;
}

export interface YandexTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface YandexUserInfo {
  id: string;
  login: string;
  client_id: string;
  display_name: string;
}
