import { WealthManagementObject } from './interfaces';

/**
 * Calculates and returns an updated WealthManagement object with computed values.
 * @param wealthManagement - The input wealth management object.
 * @returns An updated wealth management object with the delta values computed.
 */
export const computeDelta = (wealthManagement: WealthManagementObject): WealthManagementObject => {
  const totalAllocatedAmount = wealthManagement.totalCurrentAmount;
  const totalTargetAmount = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.target_amount;
  }, 0);
  const totalTargetPercentage = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.target_percentage;
  }, 0);

  const updatedWealthManagement: WealthManagementObject = {
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
      if (assetAllocation.targetPercentage !== null) {
        assetAllocation.delta =
          assetAllocation.targetPercentage - assetAllocation.allocated_percentage;
      } else if (assetAllocation.targetAmount !== null) {
        assetAllocation.delta = assetAllocation.targetAmount - assetAllocation.currentAmount;
      } else {
        throw new Error('Invalid asset allocation');
      }
    }
  }
  return updatedWealthManagement;
};
