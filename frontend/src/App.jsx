import { useState, useEffect } from 'react'
import SequenceGrid from './components/SequenceGrid'
import MemoryHeatmap from './components/MemoryHeatmap'
import StatusBar from './components/StatusBar'
import './App.css'

// VITE_API_URL is set at build time via environment variable.
// In local dev this is empty string, and the Vite proxy routes /api → localhost:5000.
// In production (Vercel) set VITE_API_URL=https://your-backend-host in Vercel settings.
const API = (import.meta.env.VITE_API_URL || '') + '/api'

export default function App() {
  const [status, setStatus] = useState({ loading: true, ok: false, message: 'Connecting…' })
  const [seqLength, setSeqLength] = useState(5)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  // Check backend on mount
  useEffect(() => {
    fetch(`${API}/status`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok') {
          setStatus({ loading: false, ok: true, message: d.checkpoint, maxLen: d.max_seq_length })
        } else {
          setStatus({ loading: false, ok: false, message: d.message || 'Backend error' })
        }
      })
      .catch(() => setStatus({ loading: false, ok: false, message: 'Cannot reach backend (is app.py running?)' }))
  }, [])

  const runNTM = async () => {
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seq_length: seqLength }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Unknown error')
      } else {
        setResult(data)
      }
    } catch (e) {
      setError('Network error — is the backend running?')
    }
    setRunning(false)
  }

  const maxLen = status.maxLen || 10

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-bracket">[</span>
            NTM
            <span className="logo-bracket">]</span>
          </div>
          <h1>Neural Turing Machine</h1>
          <p className="subtitle">TensorFlow 1.15 · Copy Task · LSTM Controller</p>
        </div>
      </header>

      <main className="main">
        <div className="panel control-panel">
          <h2 className="panel-title">Configuration</h2>

          <div className="control-row">
            <label htmlFor="seq-slider">
              Sequence Length
              <span className="val-badge">{seqLength}</span>
            </label>
            <input
              id="seq-slider"
              type="range"
              min={1}
              max={maxLen}
              value={seqLength}
              onChange={e => setSeqLength(Number(e.target.value))}
              disabled={!status.ok || running}
            />
            <div className="range-labels">
              <span>1</span>
              <span>{maxLen}</span>
            </div>
          </div>

          <button
            className={`run-btn ${running ? 'running' : ''}`}
            onClick={runNTM}
            disabled={!status.ok || running}
          >
            {running ? <><span className="spinner" /> Running…</> : '▶  Run NTM'}
          </button>

          {error && (
            <div className="error-box">
              <span className="error-icon">⚠</span> {error}
            </div>
          )}
        </div>

        <StatusBar status={status} />

        {result && (
          <>
            <div className="results-grid">
              <div className="panel">
                <h2 className="panel-title">True Output</h2>
                <SequenceGrid data={result.true_output} label="true" />
              </div>
              <div className="panel">
                <h2 className="panel-title">Predicted Output</h2>
                <SequenceGrid data={result.pred_output} label="pred" />
              </div>
            </div>

            <div className="panel diff-panel">
              <h2 className="panel-title">Comparison</h2>
              <DiffView true_out={result.true_output} pred_out={result.pred_output} />
            </div>

            <div className="panel loss-panel">
              <h2 className="panel-title">Loss</h2>
              <div className="loss-value">{result.loss.toFixed(6)}</div>
              <div className="loss-info">
                Sequence length: <strong>{result.seq_length}</strong> ·
                Bits/step: <strong>{result.true_output[0]?.length - 2 ?? '–'}</strong>
              </div>
            </div>

            <div className="results-grid">
              <div className="panel">
                <h2 className="panel-title">Write Head Weights (Input Phase)</h2>
                <MemoryHeatmap data={result.write_weights} label="write" />
              </div>
              <div className="panel">
                <h2 className="panel-title">Read Head Weights (Output Phase)</h2>
                <MemoryHeatmap data={result.read_weights} label="read" />
              </div>
            </div>
          </>
        )}

        {!result && !running && status.ok && (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <p>Set a sequence length and click <strong>Run NTM</strong> to see the copy task in action.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        NTM-tensorflow · carpedm20 · TF 1.15.5 · Python 3.7.9
      </footer>
    </div>
  )
}

// ── Diff view ────────────────────────────────────────────────────────────────
function DiffView({ true_out, pred_out }) {
  let correct = 0
  let total = 0

  const rows = true_out.map((trueRow, t) => {
    const predRow = pred_out[t] || []
    return trueRow.map((tv, b) => {
      const pv = predRow[b] ?? 0
      const match = tv === pv
      if (match) correct++
      total++
      return { tv, pv, match }
    })
  })

  const acc = total > 0 ? ((correct / total) * 100).toFixed(1) : '–'

  return (
    <div className="diff-wrapper">
      <div className="diff-acc">
        Bit accuracy: <strong>{acc}%</strong>
        <span className="acc-bar">
          <span className="acc-fill" style={{ width: `${acc}%` }} />
        </span>
      </div>
      <div className="diff-grid">
        {rows.map((row, t) => (
          <div key={t} className="diff-row">
            <span className="diff-step">t={t + 1}</span>
            {row.map((cell, b) => (
              <span
                key={b}
                className={`diff-cell ${cell.match ? 'match' : 'mismatch'}`}
                title={`t=${t + 1} b=${b}: true=${cell.tv} pred=${cell.pv}`}
              >
                {cell.tv}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
