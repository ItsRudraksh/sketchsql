> **Draw your database. Get your SQL. Ask AI anything about it.**

SketchSQL is a visual database schema designer with an integrated AI assistant. Drag-and-drop tables onto a canvas, define columns and relationships, and instantly generate production-ready SQL DDL — or just describe your system in plain English and let AI build the schema for you.

---

## Features

| Feature | Description |
|---|---|
| **Visual Canvas** | Drag-drop ER diagram builder powered by ReactFlow |
| **SQL Generation** | MySQL & PostgreSQL DDL with FK constraints, auto-sorted |
| **ORM Generation** | Django Models, Prisma Schema, SQLAlchemy — live preview |
| **Import SQL** | Paste existing `CREATE TABLE` SQL to reverse-engineer a diagram |
| **AI: NL → Schema** | Describe a system in English, get a full schema on the canvas |
| **AI: Schema Analysis** | Normalization advice (1NF/2NF/3NF), missing indexes, suggestions |
| **AI: Query Assistant** | Multi-turn chat with your schema as context |
| **Save / Load** | Auto-save + named saves via IndexedDB, up to 50 diagrams |
| **Export** | SQL file, JSON, PNG, PDF |
| **Undo / Redo** | 50-state history stack |
| **Snap to Grid** | 20px grid snapping for precise layouts |
| **Dark / Light Mode** | Dark by default, toggle in header |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+S` | Save diagram |
| `Ctrl+D` | Duplicate selected table |
| `Ctrl+A` | Select all tables |
| `Delete` / `Backspace` | Delete selected table or relationship |
| `Escape` | Deselect / close panels |
| Double-click canvas | Add new table at cursor position |

---

## Local Setup

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm / yarn | Latest |
| Git | Any |

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sketchsql.git
cd sketchsql
```

---

### 2. Backend Setup (Python + FastAPI)

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate       # macOS/Linux
# .venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt
```

Create the `.env` file in `backend/`:

```env
AZURE_OPENAI_ENDPOINT=https://<your-resource>.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=<your-azure-openai-key>
AZURE_OPENAI_DEPLOYMENT=gpt-5.4
AZURE_OPENAI_API_VERSION=2024-12-01-preview
MONGO_URL=mongodb://localhost:27017
DB_NAME=sketchsql
CORS_ORIGINS=*
```

> **Note:** MongoDB is not used for application data (all diagrams are stored client-side). The MONGO_URL/DB_NAME vars are kept for the deployment environment but not needed for core functionality.

Start the backend:

```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001`.

---

### 3. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
yarn install
# or: npm install
```

Create the `.env` file in `frontend/`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start the frontend:

```bash
yarn start
# or: npm start
```

The app will open at `http://localhost:3000`.

---

### 4. Verify everything works

```bash
# Test backend health
curl http://localhost:8001/api/

# Expected: {\"message\":\"SketchSQL API running\",\"status\":\"ok\"}
```

---

## Azure OpenAI Setup

SketchSQL uses **Azure OpenAI GPT-5.4** for AI features. You need an Azure subscription with OpenAI access.

1. Go to [Azure OpenAI Studio](https://oai.azure.com)
2. Create a resource and deploy the `gpt-5.4` model
3. Copy the endpoint, API key, and deployment name to your `.env`

> AI features (schema generation, analysis, query assistant) will show an error toast if the API key is missing or invalid. The rest of the app (canvas, SQL generation, ORM generation) works completely offline.

---

## Project Structure

```
sketchsql/
├── backend/
│   ├── server.py              # FastAPI app — all API routes, SQL generator, SQL parser
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── CanvasArea.jsx        # ReactFlow wrapper
│   │   │   │   ├── TableNode.jsx         # Custom node with inline editors
│   │   │   │   ├── RelationshipEdge.jsx  # Custom edge with type labels
│   │   │   │   └── CanvasToolbar.jsx     # Toolbar above canvas
│   │   │   ├── LeftPanel/
│   │   │   │   └── LeftPanel.jsx         # Saved diagrams list
│   │   │   ├── RightPanel/
│   │   │   │   ├── RightPanel.jsx        # Tab container
│   │   │   │   ├── SqlOutputTab.jsx      # Monaco editor + SQL controls
│   │   │   │   ├── OrmOutputTab.jsx      # Django/Prisma/SQLAlchemy output
│   │   │   │   ├── AiAssistantTab.jsx    # AI chat + schema generation
│   │   │   │   └── PropertiesTab.jsx     # Selected element editor
│   │   │   ├── Modals/
│   │   │   │   ├── ImportSqlModal.jsx
│   │   │   │   ├── SaveDiagramModal.jsx
│   │   │   │   └── WelcomeScreen.jsx
│   │   │   └── Header.jsx
│   │   ├── store/
│   │   │   ├── diagramStore.js    # Zustand: nodes, edges, history, undo/redo
│   │   │   └── uiStore.js         # Zustand: panels, theme, dialect, settings
│   │   ├── utils/
│   │   │   ├── sqlGenerator.js    # Client-side SQL DDL generation
│   │   │   ├── ormGenerator.js    # Django, Prisma, SQLAlchemy generation
│   │   │   ├── diagramLayout.js   # Auto-layout algorithm
│   │   │   ├── persistence.js     # localStorage + IndexedDB helpers
│   │   │   ├── exportUtils.js     # PNG, PDF, SQL, JSON export
│   │   │   └── exampleSchemas.js  # Built-in example schemas
│   │   ├── hooks/
│   │   │   ├── useAutoSave.js        # Auto-save every 2s
│   │   │   └── useKeyboardShortcuts.js
│   │   ├── api/
│   │   │   └── apiClient.js       # Axios instance + API helpers
│   │   └── App.js
│   ├── .env                       # Environment variables (not committed)
│   └── package.json
│
└── README.md
```

---

## Backend API Reference

All routes are prefixed with `/api`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/` | Health check |
| `POST` | `/api/generate-sql` | Diagram JSON → SQL DDL (no AI, pure logic) |
| `POST` | `/api/import-sql` | SQL string → diagram JSON (regex parser) |
| `POST` | `/api/ai/generate-schema` | Natural language → schema JSON |
| `POST` | `/api/ai/analyze-schema` | Schema JSON → normalization analysis |
| `POST` | `/api/ai/chat` | Multi-turn chat with schema context |

### Example: Generate SQL

```bash
curl -X POST http://localhost:8001/api/generate-sql \
  -H \"Content-Type: application/json\" \
  -d '{
    \"dialect\": \"mysql\",
    \"diagram\": {
      \"tables\": [{
        \"id\": \"t1\", \"name\": \"users\", \"color\": \"blue\",
        \"columns\": [
          {\"id\": \"c1\", \"name\": \"id\", \"type\": \"INT\", \"primaryKey\": true, \"autoIncrement\": true, \"nullable\": false, \"unique\": true, \"defaultValue\": \"\"},
          {\"id\": \"c2\", \"name\": \"email\", \"type\": \"VARCHAR(255)\", \"primaryKey\": false, \"autoIncrement\": false, \"nullable\": false, \"unique\": true, \"defaultValue\": \"\"}
        ]
      }],
      \"relationships\": []
    }
  }'
```

### Example: Import SQL

```bash
curl -X POST http://localhost:8001/api/import-sql \
  -H \"Content-Type: application/json\" \
  -d '{
    \"sql\": \"CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE);\",
    \"dialect\": \"mysql\"
  }'
```

---

## Data Persistence

SketchSQL is a **local-first** application — no user accounts, no server-side storage.

| Storage | Key | Use |
|---|---|---|
| `localStorage` | `sketchsql_autosave` | Auto-save every 2 seconds |
| `IndexedDB` | `SketchSQLDB.diagrams` | Named saves (up to 50) |

To **clear all data**: open browser DevTools → Application → Clear Site Data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (CRA), Tailwind CSS |
| Canvas | ReactFlow v11 |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| State | Zustand |
| Notifications | react-hot-toast |
| Export | html-to-image, jsPDF |
| Markdown | react-markdown + remark-gfm |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI | Azure OpenAI (`openai` Python SDK, AzureOpenAI client) |
| Storage | localStorage + IndexedDB (client-side only) |

---

## Development Tips

**Frontend hot reload** — Changes to `.jsx`/`.js` files take effect instantly via webpack dev server.

**Backend hot reload** — Changes to `server.py` take effect instantly via uvicorn `--reload`.

**Restart needed** only when:
- Adding new environment variables to `.env`
- Installing new packages

**Running tests** (if configured):
```bash
# Backend
cd backend && pytest

# Frontend  
cd frontend && yarn test
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m \"Add my feature\"`
4. Push and open a Pull Request

---

## License

MIT License — free to use for personal and academic projects.

---

*Built with SketchSQL for final year CSE project demo.*
"
Observation: Create successful: /README.md
