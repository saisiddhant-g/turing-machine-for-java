/**
 * Renders the read or write head attention weights as a heatmap.
 * data: Array of arrays  → [time_step][mem_location]
 * Each row is one time-step; columns are memory slots.
 * Only the top-32 memory slots are shown (the full 128 is too wide).
 */
const SHOW = 32  // memory slots to show

export default function MemoryHeatmap({ data, label }) {
  if (!data || data.length === 0) return <p className="no-data">No data</p>

  const rows = data.map(row => row.slice(0, SHOW))

  // Find max for normalising colour intensity
  const max = Math.max(...rows.flat().map(Math.abs), 1e-10)

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap" aria-label={`${label} head attention`}>
        <div className="heatmap-col-labels">
          {Array.from({ length: SHOW }, (_, i) => (
            <span key={i} className="hm-col-label">{i}</span>
          ))}
        </div>
        {rows.map((row, t) => (
          <div key={t} className="hm-row">
            <span className="hm-row-label">t{t + 1}</span>
            {row.map((v, m) => {
              const intensity = Math.min(v / max, 1)
              const alpha = 0.05 + intensity * 0.95
              return (
                <span
                  key={m}
                  className="hm-cell"
                  style={{ opacity: alpha }}
                  title={`t=${t + 1} mem=${m} w=${v.toExponential(2)}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="hm-legend">
        <span className="hm-legend-low">low</span>
        <span className="hm-legend-bar" />
        <span className="hm-legend-high">high</span>
      </div>
    </div>
  )
}
