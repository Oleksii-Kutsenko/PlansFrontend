import React from 'react';
import './ExpandableTable.css';
import { AssetAllocationRow } from './AssetAllocationRow';
import { WealthManagementObject } from '../../store';
import { formatNumber, formatPercentage } from './formatting';

interface ExpandableTableProps {
  wealthManagement: WealthManagementObject;
}

export function ExpandableTable({ wealthManagement }: ExpandableTableProps): React.ReactElement {
  const baseCurrency = wealthManagement.base_currency;

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
          {wealthManagement.allocations.map((item, index) => {
            return (
              <AssetAllocationRow
                key={index}
                allocation={item}
                baseCurrency={baseCurrency}
                wealthManagementID={wealthManagement.id}
              />
            );
          })}
          <tr className='total-row'>
            <td></td>
            <td>Total</td>
            <td>{formatNumber(wealthManagement.totalCurrentAmount, baseCurrency.symbol)}</td>
            <td>{formatNumber(wealthManagement.totalTargetAmount, baseCurrency.symbol)}</td>
            <td></td>
            <td>{formatPercentage(wealthManagement.totalTargetPercentage)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
