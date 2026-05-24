import { CurrencyInput } from '@/components/CurrencyInput';
import { PercentageInput } from '@/components/PercentageInput';
import type { AssetAllocation } from '@/features/wealthManagement/types/interfaces';

import { useUpdateAssetAllocationMutation } from '../api/wealthManagementApi';
import { formatNumber, formatPercentage } from '../utils/formatting';

export const AssetAllocationItem = ({
  assetAllocation,
}: {
  assetAllocation: AssetAllocation;
}): React.ReactElement => {
  const [updateAssetAllocation] = useUpdateAssetAllocationMutation();
  const handleSubmit =
    (fieldName: string) =>
    async (value: number): Promise<void> => {
      await updateAssetAllocation({
        assetAllocationId: assetAllocation.id,
        assetAllocation: { [fieldName]: value },
      }).unwrap();
    };
  return (
    <tr>
      <td>{assetAllocation.name}</td>
      <td>{assetAllocation.asset.name}</td>
      <td>
        <CurrencyInput
          symbol={assetAllocation.currency.symbol}
          value={assetAllocation.currentAmount}
          onSubmit={handleSubmit('current_amount')}
        />
      </td>
      <td>
        <CurrencyInput
          symbol={assetAllocation.currency.symbol}
          value={assetAllocation.targetAmount}
          onSubmit={handleSubmit('target_amount')}
        />
      </td>
      <td>{formatPercentage(assetAllocation.allocatedPercentage)}</td>
      <td>
        {assetAllocation.targetPercentage === null ? (
          <span>N/A</span>
        ) : (
          <PercentageInput
            value={assetAllocation.targetPercentage}
            onSubmit={handleSubmit('target_percentage')}
          />
        )}
      </td>
      {assetAllocation.targetPercentage === null ? (
        <td>{formatNumber(assetAllocation.delta, assetAllocation.currency.symbol)}</td>
      ) : (
        <td>{formatPercentage(assetAllocation.delta)}</td>
      )}
    </tr>
  );
};
