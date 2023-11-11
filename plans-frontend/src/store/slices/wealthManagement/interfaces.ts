export interface Currency {
  name: string;
  symbol: string;
}

interface Asset {
  name: string;
  symbol: string;
}

export interface AssetAllocation {
  id: number;
  allocated_percentage: number;
  currency: Currency;
  delta: number;
  name: string;
  asset: Asset;
  current_amount: number;
  target_amount: number | null;
  target_percentage: number | null;
}

export interface UpdateAssetAllocation {
  [fieldName: string]: number | null;
}

export interface Allocation {
  id: number;
  allocatedPercentage: number;
  asset_allocations: AssetAllocation[];
  asset_type: { name: string };
  current_amount: number;
  delta: number;
  target_amount: number;
  target_percentage: number;
}

export interface WealthManagement {
  total_current_amount: number;
  allocations: Allocation[];
  base_currency: Currency;
  totalTargetAmount: number;
  totalTargetPercentage: number;
}
