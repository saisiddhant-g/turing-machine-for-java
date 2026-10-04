export default function StatusBar({ status }) {
  if (status.loading) {
    return (
      <div className="status-bar loading">
        <span className="status-dot" /> Connecting to backend…
      </div>
    )
  }

  return (
    <div className={`status-bar ${status.ok ? 'ok' : 'err'}`}>
      <div className="status-left">
        <span className="status-dot" />
        <span>{status.ok ? 'Model Loaded' : 'Backend Unavailable'}</span>
      </div>
      <div className="status-right">
        <StatusChip label="Task" value="Copy" />
        <StatusChip label="Checkpoint" value={status.ok ? 'copy_10' : '–'} />
        <StatusChip label="Max length" value={status.maxLen ?? '–'} />
        <StatusChip label="TF" value="1.15.5" />
        <StatusChip label="Python" value="3.7.9" />
      </div>
    </div>
  )
}

function StatusChip({ label, value }) {
  return (
    <span className="status-chip">
      <span className="chip-label">{label}</span>
      <span className="chip-value">{value}</span>
    </span>
  )
}
