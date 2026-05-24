import React, { useState } from 'react';

import { Allocation, Currency } from '../types/interfaces';
import { formatNumber, formatPercentage } from '../utils/formatting';
import { AssetAllocationItem } from './AssetAllocationItem';

export const AssetAllocationRow = ({
  allocation,
  baseCurrency,
}: {
  allocation: Allocation;
  baseCurrency: Currency;
}): React.ReactElement => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <td>
          <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`} />
        </td>
        <td>{allocation.assetType.name}</td>
        <td>{formatNumber(allocation.currentAmount, baseCurrency.symbol)}</td>
        <td>{formatNumber(allocation.targetAmount, baseCurrency.symbol)}</td>
        <td>{formatPercentage(allocation.allocatedPercentage)}</td>
        <td>{formatPercentage(allocation.targetPercentage)}</td>
        {allocation.targetPercentage === null ? (
          <td>{formatNumber(allocation.delta, baseCurrency.symbol)}</td>
        ) : (
          <td>{formatPercentage(allocation.delta)}</td>
        )}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="inner-table-container">
            <table className="inner-table">
              <thead className="table-head">
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
                {allocation.assetAllocations.map((assetAllocation) => (
                  <AssetAllocationItem key={assetAllocation.id} assetAllocation={assetAllocation} />
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};
