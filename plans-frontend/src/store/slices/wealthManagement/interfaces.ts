export interface Currency {
  name: string;
  symbol: string;
}
interface Asset {
  name: string;
  symbol: string;
}
interface AssetAllocation {
  currency: Currency;
  delta: number;
  name: string;
  asset: Asset;
  current_amount: number;
  target_amount: number;
  target_percentage: number;
}

export interface Allocation {
  asset_allocations: AssetAllocation[];
  asset_type: { name: string };
  current_amount: number;
  delta: number;
  target_amount: number;
  target_percentage: number;
}

export interface WealthManagement {
  allocations: Allocation[];
  base_currency: Currency;
}
