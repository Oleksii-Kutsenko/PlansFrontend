import React from 'react';
import './ExpandableTable.css';
import { AssetAllocationRow } from './AssetAllocationRow';
import { Currency, type Allocation } from '../../store';
import { formatNumber, formatPercentage } from './formatting';

interface ExpandableTableProps {
  allocations: Allocation[];
  baseCurrency: Currency;
}

export function ExpandableTable({
  allocations,
  baseCurrency
}: ExpandableTableProps): React.ReactElement {
  const totalCurrentAmount = allocations.reduce((total, item) => {
    return (
      total +
      item.asset_allocations.reduce((subTotal, asset) => {
        return subTotal + asset.current_amount;
      }, 0)
    );
  }, 0);
  const totalAllocationAmount = allocations.reduce((total, item) => total + item.target_amount, 0);
  const totalTargetPercentage = allocations.reduce(
    (total, item) => total + item.target_percentage,
    0
  );

  return (
    <div className='table-container'>
      <table className='outer-table'>
        <thead className='table-head'>
          <tr>
            <th className='chevron'></th>
            <th className='asset-type'>Asset Type</th>
            <th className='current-amount'>Current Amount</th>
            <th className='allocation-amount'>Target Amount</th>
            <th className='allocated-percentage'>Allocated Percentage</th>
            <th className='target-percentage'>Target Percentage</th>
            <th className='difference'>Delta</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((item, index) => {
            return (
              <AssetAllocationRow
                key={index}
                assetAllocation={item}
                baseCurrency={baseCurrency}
                totalAllocationAmount={totalAllocationAmount}
              />
            );
          })}
          <tr className='total-row'>
            <td></td>
            <td>Total</td>
            <td>{formatNumber(totalCurrentAmount, baseCurrency.symbol)}</td>
            <td>{formatNumber(totalAllocationAmount, baseCurrency.symbol)}</td>
            <td></td>
            <td>{formatPercentage(totalTargetPercentage)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
