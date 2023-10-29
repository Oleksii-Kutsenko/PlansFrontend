import React, { useState } from 'react';
import { type Allocation } from '../../store';

export const AssetAllocationRow = ({
  assetAllocation,
  totalAllocationAmount
}: {
  assetAllocation: Allocation;
  totalAllocationAmount: number;
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
          <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`}></i>
        </td>
        <td>{assetAllocation.asset_type.name}</td>
        <td>
          {assetAllocation.current_amount !== null
            ? assetAllocation.current_amount.toFixed(2)
            : '0.00'}
        </td>
        <td>{assetAllocation.target_amount}</td>
        <td>
          {assetAllocation.target_percentage != null
            ? assetAllocation.target_percentage.toFixed(2) + '%'
            : ''}
        </td>
        <td></td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className='inner-table-container'>
            <table className='inner-table'>
              <thead className='table-head'>
                <tr>
                  <th className='asset-name'>Asset Name</th>
                  <th className='asset'>Asset</th>
                  <th>Current Amount</th>
                  <th>Target Amount</th>
                  <th>Target Percentage</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {/* TODO: Maybe we need to extract this into separate method */}
                {/* Continue work on displaying currency */}
                {assetAllocation.asset_allocations.map((assetAllocation, index) => {
                  return (
                    <tr key={index}>
                      <td>{assetAllocation.name}</td>
                      <td>{assetAllocation.asset.name}</td>
                      <td>
                        {assetAllocation.current_amount !== null
                          ? assetAllocation.current_amount.toFixed(2) +
                            assetAllocation.asset.currency.symbol
                          : '0.00'}
                      </td>
                      <td>
                        {assetAllocation.target_amount != null
                          ? assetAllocation.target_amount.toFixed(2)
                          : 'N/A'}
                      </td>
                      <td>
                        {assetAllocation.target_percentage != null
                          ? assetAllocation.target_percentage.toFixed(2) + '%'
                          : 'N/A'}
                      </td>
                      <td>
                        {assetAllocation.target_amount != null &&
                        assetAllocation.current_amount != null
                          ? (
                              assetAllocation.target_amount - assetAllocation.current_amount
                            ).toFixed(2)
                          : assetAllocation.target_percentage != null &&
                            assetAllocation.current_amount != null
                          ? (
                              assetAllocation.target_percentage -
                              (assetAllocation.current_amount / totalAllocationAmount) * 100
                            ).toFixed(2) + '%'
                          : 'N/A'}
                      </td>
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
