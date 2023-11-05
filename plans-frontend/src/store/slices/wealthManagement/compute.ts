import { WealthManagement } from './interfaces';

export const computeDelta = (wealthManagement: WealthManagement): WealthManagement => {
  const totalAllocatedAmount = wealthManagement.total_current_amount;
  const totalTargetAmount = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.target_amount;
  }, 0);
  const totalTargetPercentage = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.target_percentage;
  }, 0);

  wealthManagement.totalTargetAmount = totalTargetAmount;
  wealthManagement.totalTargetPercentage = totalTargetPercentage;

  for (const allocation of wealthManagement.allocations) {
    allocation.allocatedPercentage = (allocation.current_amount / totalAllocatedAmount) * 100;
    if (allocation.target_percentage !== null) {
      allocation.delta =
        allocation.target_percentage - (allocation.current_amount / totalAllocatedAmount) * 100;
    } else {
      allocation.delta = allocation.target_amount - allocation.current_amount;
    }

    for (const assetAllocation of allocation.asset_allocations) {
      if (assetAllocation.target_percentage !== null) {
        assetAllocation.delta =
          assetAllocation.target_percentage - assetAllocation.allocated_percentage;
      } else {
        assetAllocation.delta = assetAllocation.target_amount - assetAllocation.current_amount;
      }
    }
  }
  return wealthManagement;
};
