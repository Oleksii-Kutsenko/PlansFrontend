import { WealthManagementModel } from '../../../features/wealthManagement/types/interfaces';

/**
 * Calculates and returns an updated WealthManagement object with computed values.
 * @param wealthManagement - The input wealth management object.
 * @returns An updated wealth management object with the delta values computed.
 */
export const computeDelta = (wealthManagement: WealthManagementModel): WealthManagementModel => {
  const totalAllocatedAmount = wealthManagement.totalCurrentAmount;
  const totalTargetAmount = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + allocation.targetAmount;
  }, 0);
  const totalTargetPercentage = wealthManagement.allocations.reduce((acc, allocation) => {
    return acc + (allocation.targetPercentage ?? 0);
  }, 0);

  const updatedWealthManagement: WealthManagementModel = {
    ...wealthManagement,
    totalTargetAmount,
    totalTargetPercentage,
  };

  for (const allocation of updatedWealthManagement.allocations) {
    allocation.allocatedPercentage = (allocation.currentAmount / totalAllocatedAmount) * 100;
    allocation.delta =
      allocation.targetPercentage == null
        ? allocation.targetAmount - allocation.currentAmount
        : allocation.targetPercentage - (allocation.currentAmount / totalAllocatedAmount) * 100;

    for (const assetAllocation of allocation.assetAllocations) {
      if (assetAllocation.targetPercentage !== null) {
        assetAllocation.delta =
          assetAllocation.targetPercentage - assetAllocation.allocatedPercentage;
      } else if (assetAllocation.targetAmount === null) {
        throw new Error('Invalid asset allocation');
      } else {
        assetAllocation.delta = assetAllocation.targetAmount - assetAllocation.currentAmount;
      }
    }
  }
  return updatedWealthManagement;
};
