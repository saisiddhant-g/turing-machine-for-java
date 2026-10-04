# Neural Turing Machine — Web Application

A web frontend around the original NTM-tensorflow copy-task implementation.

## Architecture

```
.venv37 (Python 3.7.9 + TF 1.15.5)
│
├── NTM-tensorflow-master/   ← Original NTM code (untouched ML logic)
│   ├── ntm.py
│   ├── ntm_cell.py
│   ├── ops.py
│   ├── utils.py
│   ├── tasks/copy.py
│   ├── checkpoint/copy_10/  ← Trained weights
│   └── app.py               ← Flask API (NEW)
│
└── frontend/                ← React + Vite (NEW)
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── SequenceGrid.jsx
    │   │   ├── MemoryHeatmap.jsx
    │   │   └── StatusBar.jsx
    │   └── App.css
    └── dist/                ← Production build output
```

## Starting the Backend

```cmd
cd NTM-tensorflow-master
..\venv37\Scripts\python.exe app.py
```

The Flask server starts on **http://localhost:5000**
- Model builds and loads the checkpoint automatically at startup (~20s)

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status` | Health check, model/checkpoint info |
| POST | `/api/run` | Run copy task inference |

POST body: `{ "seq_length": 5 }`  (integer 1–10)

Response: `{ true_output, pred_output, read_weights, write_weights, loss, seq_length }`

## Starting the Frontend (Development)

```cmd
cd frontend
npm run dev
```

Open **http://localhost:3000**

The Vite dev server proxies `/api/*` to `http://localhost:5000` automatically.

## Building the Frontend (Production)

```cmd
cd frontend
npm run build
```

Output goes to `frontend/dist/`.  You can serve it with any static file server.
For the full app, the Flask backend must still run separately.

## Compatibility Notes

- Python **3.7.9** required (TF 1.15.5 does not support Python 3.8+)
- TensorFlow **1.15.5** (not 2.x)
- Use the `.venv37` virtual environment
- `protobuf==3.20.3` pinned for TF 1.15 compatibility
- Deprecation warnings from TF are expected and harmless

## Changes Made to Original Code

| File | Change |
|------|--------|
| `tasks/copy.py` | `xrange` → `range` in `train()` |
| `tasks/recall.py` | `xrange` → `range`; fixed undefined `start_symbol`/`end_symbol` variable names; `tf.initialize_all_variables` → `tf.global_variables_initializer` |
| `ops.py` | `xrange` → `range` in `circular_convolution` and `outer_product` |
| `ntm_cell.py` | `xrange` → `range` everywhere (already worked via utils shim, now explicit) |
| `ntm.py` | `softmax_loss_function` signature fixed (`inputs` → `logits`) — was already done |
| `app.py` | **New file** — Flask API wrapper |
| `requirements.txt` | **New file** |

**The NTM ML architecture, trained weights, and checkpoint are completely unchanged.**
