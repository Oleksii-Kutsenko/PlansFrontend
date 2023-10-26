import React from 'react';
import './ExpandableTable.css';
import { AssetAllocationRow } from './AssetAllocationRow';
import { type Allocation } from '../../store';

interface ExpandableTableProps {
  data: Allocation[];
}

export function ExpandableTable({ data }: ExpandableTableProps): React.ReactElement {
  const totalCurrentAmount = data.reduce((total, item) => {
    return (
      total +
      item.asset_allocations.reduce((subTotal, asset) => {
        return subTotal + asset.current_amount;
      }, 0)
    );
  }, 0);
  const totalAllocationAmount = data.reduce((total, item) => total + item.target_amount, 0);
  const totalTargetPercentage = data.reduce((total, item) => total + item.target_percentage, 0);

  return (
    <div className='table-container'>
      <table className='outer-table'>
        <thead className='table-head'>
          <tr>
            <th className='chevron'></th>
            <th className='asset-type'>Asset Type</th>
            <th className='current-amount'>Current Amount</th>
            <th className='allocation-amount'>Target Amount</th>
            <th className='target-percentage'>Target Percentage</th>
            <th className='difference'>Difference</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            return (
              <AssetAllocationRow
                key={index}
                assetAllocation={item}
                totalAllocationAmount={totalAllocationAmount}
              />
            );
          })}
          <tr className='total-row'>
            <td>Total</td>
            <td></td>
            <td>{totalCurrentAmount.toFixed(2)}</td>
            <td>{totalAllocationAmount.toFixed(2)}</td>
            <td>{totalTargetPercentage.toFixed(2)}%</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
