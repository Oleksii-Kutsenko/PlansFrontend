import React, { useState } from 'react';
import { type Currency, type Allocation } from '../../store';
import { formatNumber, formatPercentage } from './formatting';
import { CurrencyInput } from 'components/CurrencyInput';

export const AssetAllocationRow = ({
  assetAllocation,
  baseCurrency
}: {
  assetAllocation: Allocation;
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
          <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`}></i>
        </td>
        <td>{assetAllocation.asset_type.name}</td>
        <td>{formatNumber(assetAllocation.current_amount, baseCurrency.symbol)}</td>
        <td>{formatNumber(assetAllocation.target_amount, baseCurrency.symbol)}</td>
        <td>{formatPercentage(assetAllocation.allocatedPercentage)}</td>
        <td>{formatPercentage(assetAllocation.target_percentage)}</td>
        {assetAllocation.target_percentage === null ? (
          <td>{formatNumber(assetAllocation.delta, baseCurrency.symbol)}</td>
        ) : (
          <td>{formatPercentage(assetAllocation.delta)}</td>
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
                {assetAllocation.asset_allocations.map((assetAllocation, index) => {
                  return (
                    <tr key={index}>
                      <td>{assetAllocation.name}</td>
                      <td>{assetAllocation.asset.name}</td>
                      <td>
                        <CurrencyInput
                          value={assetAllocation.current_amount}
                          updateValue={() => {}}
                        />
                      </td>
                      <td>
                        {formatNumber(
                          assetAllocation.target_amount,
                          assetAllocation.currency.symbol
                        )}
                      </td>
                      <td>{formatPercentage(assetAllocation.allocated_percentage)}</td>
                      <td>{formatPercentage(assetAllocation.target_percentage)}</td>
                      {assetAllocation.target_percentage === null ? (
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
