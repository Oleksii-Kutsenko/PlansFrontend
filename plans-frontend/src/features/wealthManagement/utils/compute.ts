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

  const updatedAllocations = wealthManagement.allocations.map((allocation) => {
    const allocatedPercentage =
      totalAllocatedAmount === 0 ? 0 : (allocation.currentAmount / totalAllocatedAmount) * 100;
    const delta =
      allocation.targetPercentage == null
        ? allocation.targetAmount - allocation.currentAmount
        : allocation.targetPercentage - allocatedPercentage;

    const updatedAssetAllocations = allocation.assetAllocations.map((assetAllocation) => {
      let assetDelta: number;
      if (assetAllocation.targetPercentage !== null) {
        assetDelta = assetAllocation.targetPercentage - assetAllocation.allocatedPercentage;
      } else if (assetAllocation.targetAmount === null) {
        console.warn(
          'Invalid asset allocation: both targetPercentage and targetAmount are null',
          assetAllocation,
        );
        assetDelta = 0;
      } else {
        assetDelta = assetAllocation.targetAmount - assetAllocation.currentAmount;
      }

      return {
        ...assetAllocation,
        delta: assetDelta,
      };
    });

    return {
      ...allocation,
      allocatedPercentage,
      delta,
      assetAllocations: updatedAssetAllocations,
    };
  });

  return {
    ...wealthManagement,
    totalTargetAmount,
    totalTargetPercentage,
    allocations: updatedAllocations,
  };
};
