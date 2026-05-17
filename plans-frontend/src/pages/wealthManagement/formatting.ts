export const formatNumber = (number: number | null, currencySymbol: string) => {
  if (number === null) {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${number.toFixed(2)}`;
};

export const formatPercentage = (percentage: number | null) => {
  return percentage === null ? 'N/A' : `${percentage.toFixed(2)}%`;
};
