/**
 * Renders a 2-D binary sequence as a grid of coloured cells.
 * Each row = one time-step; each column = one bit.
 * Bits 0 and 1 are delimiters (start/end symbols), shown with low opacity.
 */
export default function SequenceGrid({ data, label }) {
  if (!data || data.length === 0) return null

  return (
    <div className="seq-grid" aria-label={`${label} sequence`}>
      {data.map((row, t) => (
        <div key={t} className="seq-row">
          <span className="seq-t">t{t + 1}</span>
          {row.map((bit, b) => (
            <span
              key={b}
              className={`seq-bit ${bit ? 'bit-on' : 'bit-off'} ${b < 2 ? 'bit-delim' : ''}`}
              title={`t=${t + 1} bit=${b} val=${bit}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
