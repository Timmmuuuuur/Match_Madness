interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="progress-wrap">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
