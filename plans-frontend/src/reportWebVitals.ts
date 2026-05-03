import type { Metric } from 'web-vitals';

export type ReportHandler = (metric: Metric) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler): void => {
  if (typeof onPerfEntry !== 'function') return;

  void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB, onFID }) => {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);

    onINP(onPerfEntry);
    onFID(onPerfEntry);
  });};

export default reportWebVitals;
