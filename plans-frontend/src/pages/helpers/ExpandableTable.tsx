import React, { useState } from 'react';
import './ExpandableTable.css';

interface Asset {
  asset_name: string;
  asset: { name: string };
  current_amount: number;
  target_amount: number;
  target_percentage: number;
}

interface Allocation {
  asset_allocations: Asset[];
  asset_type: { name: string };
  allocation_amount: number;
  target_percentage: number;
}

interface ExpandableTableProps {
  data: Allocation[];
}

const AssetAllocationRow = ({
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
        <td>{}</td>
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

export function ExpandableTable({ data }: ExpandableTableProps): React.ReactElement {
  const totalCurrentAmount = data.reduce((total, item) => {
    return (
      total +
      item.asset_allocations.reduce((subTotal, asset) => {
        return subTotal + asset.current_amount;
      }, 0)
    );
  }, 0);
  const totalAllocationAmount = data.reduce((total, item) => total + item.allocation_amount, 0);
  const totalTargetPercentage = data.reduce((total, item) => total + item.target_percentage, 0);

  return (
    <div className="table-container">
      <table className="outer-table">
        <thead className="table-head">
          <tr>
            <th className="chevron"></th>
            <th className="asset-type">Asset Type</th>
            <th className="current-amount">Current Amount</th>
            <th className="allocation-amount">Allocation Amount</th>
            <th className="target-percentage">Target Percentage</th>
            <th className="difference">Difference</th>
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
          <tr className="total-row">
            <td>Total</td>
            <td></td>
            <td>{totalCurrentAmount.toFixed(2)}</td>
            <td>{totalAllocationAmount.toFixed(2)}</td>
            <td>{totalTargetPercentage.toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
