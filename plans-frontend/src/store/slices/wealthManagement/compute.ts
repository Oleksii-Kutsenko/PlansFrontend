import { WealthManagement } from './interfaces';

/**
 * Calculates and returns an updated WealthManagement object with computed values.
 * @param wealthManagement - The input wealth management object.
 * @returns An updated wealth management object with the delta values computed.
 */
export const computeDelta = (wealthManagement: WealthManagement): WealthManagement => {
  const totalAllocatedAmount = wealthManagement.total_current_amount;
  const totalTargetAmount = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.target_amount;
  }, 0);
  const totalTargetPercentage = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.target_percentage;
  }, 0);

  const updatedWealthManagement: WealthManagement = {
    ...wealthManagement,
    totalTargetAmount,
    totalTargetPercentage
  };

  for (const allocation of updatedWealthManagement.allocations) {
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
      } else if (assetAllocation.target_amount !== null) {
        assetAllocation.delta = assetAllocation.target_amount - assetAllocation.current_amount;
      } else {
        throw new Error('Invalid asset allocation');
      }
    }
  }
  return updatedWealthManagement;
};
