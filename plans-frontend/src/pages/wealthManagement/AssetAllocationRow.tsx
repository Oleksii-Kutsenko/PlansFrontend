import React, { useState } from 'react';
import { type Allocation } from './ExpandableTable';

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
        }}>
        <td>
          <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`}></i>
        </td>
        <td>{assetAllocation.asset_type.name}</td>
        <td></td>
        <td>{assetAllocation.allocation_amount}</td>
        <td>
          {assetAllocation.target_percentage != null
            ? assetAllocation.target_percentage.toFixed(2) + '%'
            : ''}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="inner-table-container">
            <table className="inner-table">
              <thead>
                <tr>
                  <th className="asset-name">Asset Name</th>
                  <th className="asset">Asset</th>
                  <th>Current Amount</th>
                  <th>Allocation Amount</th>
                  <th>Target Percentage</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {assetAllocation.asset_allocations.map((asset, index) => {
                  return (
                    <tr key={index}>
                      <td>{asset.asset_name}</td>
                      <td>{asset.asset.name}</td>
                      <td>{asset.current_amount}</td>
                      <td>
                        {asset.target_amount != null ? asset.target_amount.toFixed(2) : 'N/A'}
                      </td>
                      <td>
                        {asset.target_percentage != null
                          ? asset.target_percentage.toFixed(2) + '%'
                          : 'N/A'}
                      </td>
                      <td>
                        {asset.target_amount != null && asset.current_amount != null
                          ? (asset.target_amount - asset.current_amount).toFixed(2)
                          : asset.target_percentage != null && asset.current_amount != null
                          ? (
                              asset.target_percentage -
                              (asset.current_amount / totalAllocationAmount) * 100
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
