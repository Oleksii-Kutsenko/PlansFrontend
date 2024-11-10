import React, { useState } from 'react';
import { type Currency, type Allocation, wealthManagementActions } from '../../store';
import { formatNumber, formatPercentage } from './formatting';
import { CurrencyInput } from 'components/CurrencyInput';
import { PercentageInput } from 'components/PercentageInput';
import { fetcher } from '../../utils/axios';
import { useAppDispatch } from '../../store/hooks';

export const AssetAllocationRow = ({
  allocation,
  baseCurrency,
  wealthManagementID
}: {
  allocation: Allocation;
  baseCurrency: Currency;
  wealthManagementID: number;
}): React.ReactElement => {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (
    fieldName: string,
    assetAllocationId: number
  ): ((value: number) => Promise<void>) => {
    return async (value: number): Promise<void> => {
      try {
        await fetcher.patch(`/api/assets/asset-allocation/${assetAllocationId}/`, {
          [fieldName]: value
        });
        dispatch(wealthManagementActions.fetchWealthManagement(wealthManagementID));
      } catch (err) {
        console.log(err);
        return Promise.reject(err);
      }
    };
  };

  return (
    <>
      <tr
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <td>
          <a>
            <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`}></i>
          </a>
        </td>
        <td>{allocation.asset_type.name}</td>
        <td>{formatNumber(allocation.current_amount, baseCurrency.symbol)}</td>
        <td>{formatNumber(allocation.target_amount, baseCurrency.symbol)}</td>
        <td>{formatPercentage(allocation.allocatedPercentage)}</td>
        <td>{formatPercentage(allocation.target_percentage)}</td>
        {allocation.target_percentage === null ? (
          <td>{formatNumber(allocation.delta, baseCurrency.symbol)}</td>
        ) : (
          <td>{formatPercentage(allocation.delta)}</td>
        )}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className='inner-table-container'>
            <table className='inner-table'>
              <thead className='table-head'>
                <tr>
                  <th>Asset Name</th>
                  <th>Asset</th>
                  <th>Current Amount</th>
                  <th>Target Amount</th>
                  <th>Allocated Percentage</th>
                  <th>Target Percentage</th>
                  <th>Delta</th>
                </tr>
              </thead>
              <tbody>
                {allocation.asset_allocations.map((assetAllocation, index) => {
                  return (
                    <tr key={index}>
                      <td>{assetAllocation.name}</td>
                      <td>{assetAllocation.asset.name}</td>
                      <td>
                        <CurrencyInput
                          symbol={assetAllocation.currency.symbol}
                          value={assetAllocation.currentAmount}
                          onSubmit={handleSubmit('current_amount', assetAllocation.id)}
                        />
                      </td>
                      <td>
                        <CurrencyInput
                          symbol={assetAllocation.currency.symbol}
                          value={assetAllocation.targetAmount}
                          onSubmit={handleSubmit('target_amount', assetAllocation.id)}
                        />
                      </td>
                      <td>{formatPercentage(assetAllocation.allocated_percentage)}</td>
                      <td>
                        {assetAllocation.targetPercentage === null ? (
                          <span>N/A</span>
                        ) : (
                          <PercentageInput
                            value={assetAllocation.targetPercentage}
                            onSubmit={handleSubmit('target_percentage', assetAllocation.id)}
                          />
                        )}
                      </td>
                      {assetAllocation.targetPercentage === null ? (
                        <td>
                          {formatNumber(assetAllocation.delta, assetAllocation.currency.symbol)}
                        </td>
                      ) : (
                        <td>{formatPercentage(assetAllocation.delta)}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};
