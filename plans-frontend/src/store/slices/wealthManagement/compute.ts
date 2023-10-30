import { WealthManagement } from './interfaces';
// TODO: Continue from here, implement delta calculation, improve table layout (change table header styles)
// TODO: and begin autoconversion of different currencies to base currency, fix linter issues
export const computeDelta = (wealthManagement: WealthManagement): WealthManagement => {
  const totalAllocatedAmount = wealthManagement.allocations.reduce((acc, allocation) => {
    return (
      acc +
      allocation.asset_allocations.reduce((acc, assetAllocation) => {
        return acc + assetAllocation.current_amount;
      }, 0)
    );
  }, 0);
  const totalTargetAmount = wealthManagement.allocations.reduce((acc, allocation) => {
    return (
      acc +
      allocation.asset_allocations.reduce((acc, assetAllocation) => {
        return acc + assetAllocation.target_amount;
      }, 0)
    );
  }, 0);

  for (const allocation of wealthManagement.allocations) {
    if (allocation.target_percentage !== null) {
      allocation.allocated_percentage = (allocation.current_amount / totalAllocatedAmount) * 100;
      allocation.delta =
        allocation.target_percentage - (allocation.current_amount / totalAllocatedAmount) * 100;
    } else {
      allocation.delta = allocation.target_amount - allocation.current_amount;
    }
    for (const assetAllocation of allocation.asset_allocations) {
      assetAllocation.delta = assetAllocation.target_amount - assetAllocation.current_amount;
    }
  }
  return wealthManagement;
};
