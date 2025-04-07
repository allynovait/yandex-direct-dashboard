
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
