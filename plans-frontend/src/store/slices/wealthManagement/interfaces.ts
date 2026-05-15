export interface Currency {
  name: string;
  symbol: string;
}

interface Asset {
  name: string;
  symbol: string;
}

export interface AssetAllocation {
  exchangedAmount: number;
  id: number;
  allocatedPercentage: number;
  currency: Currency;
  delta: number;
  name: string;
  asset: Asset;
  currentAmount: number;
  targetAmount: number | null;
  targetPercentage: number | null;
}

export type UpdateAssetAllocation = Record<string, number | null>;

export interface Allocation {
  id: number;
  allocatedPercentage: number;
  assetAllocations: AssetAllocation[];
  assetType: { name: string };
  currentAmount: number;
  delta: number;
  targetAmount: number;
  targetPercentage: number;
}

export interface WealthManagementModel {
  id: number;
  totalCurrentAmount: number;
  allocations: Allocation[];
  baseCurrency: Currency;
  totalTargetAmount: number;
  totalTargetPercentage: number;
}
