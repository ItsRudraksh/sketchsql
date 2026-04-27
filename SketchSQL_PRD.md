# SketchSQL — Product Requirements Document
**Version:** 1.0  
**For:** Emergent AI (full end-to-end build)  
**Target:** Final Year CSE College Project  
**Build type:** Web Application (React + Node.js/Express backend)

---

## 1. Project Overview

SketchSQL is a visual database schema designer with an integrated AI assistant. Users drag-and-drop entities onto a canvas to build ER diagrams, define columns and relationships, and instantly generate production-ready SQL DDL. An AI assistant (powered by Azure OpenAI GPT-5.4) understands the live diagram context and can auto-build schemas from plain English, suggest normalization improvements, and write complex queries on demand.

**Elevator pitch:** "Draw your database. Get your SQL. Ask AI anything about it."

---

## 2. Tech Stack

### Frontend
- **React** (with Vite)
- **ReactFlow** — canvas/diagram engine (open source, free)
- **Monaco Editor** — SQL output editor (same engine as VS Code)
- **Tailwind CSS** — styling
- **Zustand** — state management
- **React Hot Toast** — notifications

### Backend
- **Node.js + Express** — thin API server
- **No database required** — diagrams persist client-side (localStorage + IndexedDB)

### AI Integration
- **Azure OpenAI** — GPT-5.4
  - Endpoint: `https://rudrakshkapoor1408-3643-resource.cognitiveservices.azure.com/`
  - Deployment: `gpt-5.4`
  - Model: `gpt-5.4`
  - API Version: `2024-12-01-preview`
  - SDK: `openai` npm package (AzureOpenAI client)
  - Max tokens per request: `16384`
  - **API key must be stored in a `.env` file on the backend as `AZURE_OPENAI_API_KEY`. Never expose it in frontend code.**

### AI API call pattern (backend route, to be used for all AI features):
```javascript
import { AzureOpenAI } from "openai";

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: "2024-12-01-preview"
});

const response = await client.chat.completions.create({
  model: process.env.AZURE_OPENAI_DEPLOYMENT,
  messages: [...],
  max_completion_tokens: 16384
});
```

---

## 3. Application Layout

The app has a **three-panel layout**:

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Dialect Toggle (MySQL/PostgreSQL) | Save | Export│
├──────────┬──────────────────────────────────┬───────────────────┤
│          │                                  │                   │
│ LEFT     │       CANVAS (ReactFlow)         │   RIGHT PANEL     │
│ PANEL    │                                  │                   │
│          │  Drag-drop ER diagram builder    │  Tabs:            │
│ Saved    │  Nodes = Tables                  │  [SQL Output]     │
│ Diagrams │  Edges = Relationships           │  [AI Assistant]   │
│          │                                  │  [Properties]     │
│ + New    │                                  │                   │
│          │                                  │                   │
└──────────┴──────────────────────────────────┴───────────────────┘
```

- **Left panel** (~220px): List of saved diagrams (from localStorage/IndexedDB), "New Diagram" button, diagram rename/delete.
- **Center canvas** (flex-grow): ReactFlow canvas — the main work area.
- **Right panel** (~360px): Tabbed panel with SQL Output, AI Assistant chat, and Properties editor.

---

## 4. Core Features

### 4.1 Visual ER Diagram Builder (Canvas)

- **Add Table node**: Double-click empty canvas area OR click "+ Add Table" toolbar button. A new node appears with a default name ("Table1", "Table2"...).
- **Table node structure**:
  - Header row: table name (editable inline, double-click)
  - Column rows, each showing: `[PK icon] column_name : datatype [NOT NULL] [UNIQUE]`
  - "+ Add Column" button at the bottom of each node
  - Right-click context menu on node: Rename, Add Column, Delete Table, Set Color (6 color options for organization)
- **Column editing**: Click any column row to open an inline editor showing:
  - Column name (text input)
  - Data type (dropdown: INT, BIGINT, VARCHAR(n), TEXT, BOOLEAN, DATE, DATETIME, TIMESTAMP, DECIMAL(p,s), UUID, FLOAT, JSON)
  - Nullable toggle
  - Unique toggle
  - Default value (text input, optional)
  - Primary Key checkbox (only one per table, auto-adds `NOT NULL`)
  - Auto-increment checkbox (only for INT/BIGINT PK)
  - Delete column button
- **Relationships (Edges)**:
  - Drag from a column's right handle to another table's left handle to create a relationship
  - Edge types (selectable on the edge): One-to-One, One-to-Many, Many-to-Many
  - Edge label shows the relationship type (1:1, 1:N, M:N)
  - Click an edge to open properties: set FK column name, ON DELETE behavior (CASCADE, SET NULL, RESTRICT), ON UPDATE behavior
  - Many-to-Many edges auto-suggest creating a junction table (show a toast with a button: "Auto-create junction table")
- **Canvas controls**:
  - Zoom in/out (mouse wheel + buttons)
  - Fit view button
  - Mini-map (bottom right corner of canvas, toggleable)
  - Grid snapping (toggle)
  - Select multiple nodes (shift+click or drag select), then move or delete together
  - Undo/Redo (Ctrl+Z / Ctrl+Shift+Z) — maintain a history stack of up to 50 states

### 4.2 SQL DDL Generation

- A **"Generate SQL"** button is always visible above the right panel SQL tab.
- When clicked, the frontend serializes the full diagram state (tables, columns, relationships) and sends it to the backend `/api/generate-sql` endpoint.
- The backend builds the SQL string purely with logic (no AI needed for this — deterministic generation). The AI is NOT called for DDL generation, keeping it fast and free of token cost.
- **Output includes**:
  - `CREATE TABLE` statements in dependency order (referenced tables first)
  - Primary key constraints
  - Foreign key constraints with ON DELETE/ON UPDATE actions
  - UNIQUE constraints
  - NOT NULL constraints
  - AUTO_INCREMENT (MySQL) or SERIAL/SEQUENCE (PostgreSQL) based on dialect toggle
  - Column default values
  - For Many-to-Many: auto-generates the junction table DDL
- SQL output appears in **Monaco Editor** (right panel, SQL tab) with syntax highlighting.
- **Copy to clipboard** button and **Download as .sql file** button above the Monaco editor.
- The SQL regenerates automatically every time the diagram changes (debounced 800ms).

### 4.3 SQL Dialect Toggle

- A toggle in the header switches between **MySQL** and **PostgreSQL**.
- Switching the dialect immediately regenerates the SQL output.
- Dialect differences handled:
  - MySQL: `INT AUTO_INCREMENT`, backtick identifiers, `ENGINE=InnoDB`, `VARCHAR` limits
  - PostgreSQL: `SERIAL` / `BIGSERIAL`, double-quote identifiers, `TEXT` type, `BOOLEAN` as native type
- The active dialect is shown clearly in the header (e.g., a pill badge: "MySQL" or "PostgreSQL").

### 4.4 Import SQL → Diagram

- A **"Import SQL"** button opens a modal with a text area.
- User pastes existing `CREATE TABLE` SQL statements (MySQL or PostgreSQL).
- The backend `/api/import-sql` endpoint parses the SQL and returns a normalized diagram JSON.
- The app renders the imported tables as nodes on the canvas, auto-layouted in a grid.
- Supported: `CREATE TABLE`, `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `DEFAULT`, `AUTO_INCREMENT`, `SERIAL`.

### 4.5 Diagram Save / Load (localStorage + IndexedDB)

- **Auto-save**: The diagram state is auto-saved to localStorage every 2 seconds while changes are being made. Key: `sketchsql_autosave`.
- **Named saves**: User can click "Save" in the header, enter a diagram name, and save to IndexedDB. Up to 50 saved diagrams supported.
- **Left panel** shows all saved diagrams with: name, last modified date, table count. Click to load. Right-click to rename or delete.
- **On app load**: Restore from autosave if it exists.
- **Export diagram as JSON**: "Export JSON" button downloads the raw diagram state as a `.json` file. "Import JSON" button lets users load it back.

### 4.6 AI Feature 1 — Natural Language → Auto-Build Diagram

- Located in the AI Assistant panel (right panel, AI tab).
- A text input at the top: `"Describe a schema in plain English..."`
- Example prompts shown as chips below the input: "E-commerce store", "Blog with comments", "University course management", "Hospital management system"
- When user submits a prompt, the frontend calls backend `/api/ai/generate-schema`.
- **Backend system prompt:**
```
You are a database schema designer. The user will describe a system in plain English.
You must respond ONLY with a valid JSON object representing a database schema.
No explanation, no markdown, no backticks. Only raw JSON.

The JSON must follow this exact schema:
{
  "tables": [
    {
      "id": "unique_string_id",
      "name": "TableName",
      "color": "blue|green|purple|orange|red|gray",
      "columns": [
        {
          "id": "unique_col_id",
          "name": "column_name",
          "type": "INT|VARCHAR(255)|TEXT|BOOLEAN|DATE|DATETIME|TIMESTAMP|DECIMAL(10,2)|UUID|BIGINT|FLOAT|JSON",
          "primaryKey": true|false,
          "autoIncrement": true|false,
          "nullable": true|false,
          "unique": true|false,
          "defaultValue": "value or empty string"
        }
      ]
    }
  ],
  "relationships": [
    {
      "id": "unique_rel_id",
      "sourceTableId": "id",
      "sourceColumnId": "id",
      "targetTableId": "id",
      "targetColumnId": "id",
      "type": "one-to-one|one-to-many|many-to-many",
      "onDelete": "CASCADE|SET NULL|RESTRICT",
      "onUpdate": "CASCADE|SET NULL|RESTRICT"
    }
  ]
}
```
- The frontend receives this JSON, converts it to ReactFlow nodes/edges, and renders it on the canvas. Auto-layout using a simple left-to-right layered algorithm.
- A success toast: "Schema generated — 6 tables added to canvas"
- If the canvas already has content, ask the user: "Replace current diagram or merge?" (modal with two buttons).

### 4.7 AI Feature 2 — Schema Explain & Normalization Suggestions

- In the AI Assistant panel, a button: **"Analyze My Schema"**
- Clicking it sends the full current diagram JSON to backend `/api/ai/analyze-schema`.
- **Backend system prompt:**
```
You are a senior database architect. You will be given a database schema as JSON.
Analyze it and provide:
1. A plain English explanation of what this schema models (2-3 sentences)
2. Normalization issues found (1NF, 2NF, 3NF violations if any) — be specific about which table/column
3. Specific improvement suggestions (missing indexes, redundant columns, naming conventions)
4. A normalized form suggestion if the schema has issues

Format your response in clear sections with headings. Be concise and specific.
The schema context (tables and relationships) will be appended to this prompt by the system.
```
- The AI response renders in the AI chat panel as a formatted assistant message (markdown rendered).
- The user can follow up with more questions in the same chat thread — the full conversation history is maintained in React state and sent with each subsequent message.

### 4.8 AI Feature 3 — Query Assistant

- In the AI Assistant panel, a text input: **"Ask about your schema or request a query..."**
- The current diagram JSON is always included as context in every message sent to the AI.
- **Backend system prompt:**
```
You are an expert SQL query writer and database consultant. You have full knowledge of the user's current database schema (provided below as JSON). 

When asked to write queries:
- Write clean, well-commented SQL
- Use proper JOINs based on the defined foreign keys
- Always specify the dialect (MySQL or PostgreSQL) in your response
- If the query differs between dialects, show both versions

When asked questions about the schema:
- Reference specific table and column names from the schema
- Be precise and technically accurate

Current dialect: {dialect}
Current schema:
{schemaJSON}
```
- This powers a full chat interface in the right panel. User can ask things like:
  - "Write a query to get all orders with their customer names"
  - "How do I query the most recent 10 posts with author details?"
  - "What indexes should I add for performance?"
- AI responses with SQL blocks are rendered with syntax highlighting (using a simple `<pre>` with Monaco or highlight.js).
- Chat history is maintained per-diagram session in React state.
- **"Clear Chat"** button to reset the conversation.

---

## 5. Additional UI Features

### 5.1 Toolbar (above canvas)
Buttons: Add Table | Import SQL | Fit View | Toggle Grid | Toggle Minimap | Undo | Redo

### 5.2 Export Options (header dropdown)
- Export as SQL (`.sql` file)
- Export as JSON (`.json` diagram state)
- Export as PNG (canvas screenshot using `html-to-image`)
- Export as PDF (using browser print / `html-to-image` + jsPDF)

### 5.3 Keyboard Shortcuts
- `Ctrl+Z` — Undo
- `Ctrl+Shift+Z` / `Ctrl+Y` — Redo
- `Delete` / `Backspace` — Delete selected node or edge
- `Ctrl+S` — Save diagram
- `Ctrl+D` — Duplicate selected table
- `Ctrl+A` — Select all
- `Escape` — Deselect / close panels

### 5.4 Welcome Screen
- On first load (no saved diagrams), show a centered welcome screen on the canvas with:
  - App name and tagline
  - Three getting-started options as cards: "Start from scratch", "Try an example schema", "Describe schema with AI"
  - Example schemas: E-commerce, Blog, University, Hospital

### 5.5 Theme
- Light and dark mode toggle in the header. Default: match system preference.
- ReactFlow canvas, nodes, and panels all adapt to the active theme.

---

## 6. Backend API Routes

All routes are under `/api`. Backend runs on port 3001. Frontend proxies `/api` to backend.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/generate-sql` | Accepts diagram JSON, returns SQL DDL string (no AI, pure logic) |
| POST | `/api/import-sql` | Accepts SQL string, returns diagram JSON |
| POST | `/api/ai/generate-schema` | NL prompt → schema JSON (AI) |
| POST | `/api/ai/analyze-schema` | Schema JSON → analysis text (AI) |
| POST | `/api/ai/chat` | Multi-turn chat with schema context (AI) |

### Request/Response shapes

**POST /api/generate-sql**
```json
Request:  { "diagram": { ...diagramJSON }, "dialect": "mysql" | "postgresql" }
Response: { "sql": "CREATE TABLE ..." }
```

**POST /api/import-sql**
```json
Request:  { "sql": "CREATE TABLE ...", "dialect": "mysql" | "postgresql" }
Response: { "diagram": { ...diagramJSON } }
```

**POST /api/ai/generate-schema**
```json
Request:  { "prompt": "e-commerce store with products, orders, users" }
Response: { "diagram": { ...diagramJSON } }
```

**POST /api/ai/analyze-schema**
```json
Request:  { "diagram": { ...diagramJSON }, "dialect": "mysql" | "postgresql" }
Response: { "analysis": "markdown string" }
```

**POST /api/ai/chat**
```json
Request:  {
  "messages": [ { "role": "user", "content": "..." }, ... ],
  "diagram": { ...diagramJSON },
  "dialect": "mysql" | "postgresql"
}
Response: { "reply": "markdown string" }
```

---

## 7. Data Structures

### Diagram JSON (canonical format, stored in localStorage/IndexedDB and sent to backend)
```json
{
  "id": "uuid",
  "name": "My Schema",
  "dialect": "mysql",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "tables": [
    {
      "id": "t1",
      "name": "users",
      "color": "blue",
      "position": { "x": 100, "y": 150 },
      "columns": [
        {
          "id": "c1",
          "name": "id",
          "type": "INT",
          "primaryKey": true,
          "autoIncrement": true,
          "nullable": false,
          "unique": true,
          "defaultValue": ""
        },
        {
          "id": "c2",
          "name": "email",
          "type": "VARCHAR(255)",
          "primaryKey": false,
          "autoIncrement": false,
          "nullable": false,
          "unique": true,
          "defaultValue": ""
        }
      ]
    }
  ],
  "relationships": [
    {
      "id": "r1",
      "sourceTableId": "t2",
      "sourceColumnId": "c5",
      "targetTableId": "t1",
      "targetColumnId": "c1",
      "type": "many-to-one",
      "onDelete": "CASCADE",
      "onUpdate": "CASCADE",
      "label": ""
    }
  ]
}
```

---

## 8. Environment Variables

Create a `.env` file in the backend root:
```
AZURE_OPENAI_ENDPOINT=https://rudrakshkapoor1408-3643-resource.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=<your-key-here>
AZURE_OPENAI_DEPLOYMENT=gpt-5.4
AZURE_OPENAI_API_VERSION=2024-12-01-preview
PORT=3001
```

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:3001
```

---

## 9. Project Structure

```
sketchsql/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas/
│   │   │   │   ├── CanvasArea.jsx          # ReactFlow wrapper
│   │   │   │   ├── TableNode.jsx           # Custom ReactFlow node
│   │   │   │   ├── RelationshipEdge.jsx    # Custom ReactFlow edge
│   │   │   │   └── CanvasToolbar.jsx       # Toolbar above canvas
│   │   │   ├── LeftPanel/
│   │   │   │   ├── LeftPanel.jsx
│   │   │   │   └── DiagramListItem.jsx
│   │   │   ├── RightPanel/
│   │   │   │   ├── RightPanel.jsx          # Tab container
│   │   │   │   ├── SqlOutputTab.jsx        # Monaco editor + controls
│   │   │   │   ├── AiAssistantTab.jsx      # Chat UI + NL generate
│   │   │   │   └── PropertiesTab.jsx       # Selected node/edge editor
│   │   │   ├── Modals/
│   │   │   │   ├── ImportSqlModal.jsx
│   │   │   │   ├── SaveDiagramModal.jsx
│   │   │   │   └── WelcomeScreen.jsx
│   │   │   └── Header.jsx
│   │   ├── store/
│   │   │   ├── diagramStore.js             # Zustand: tables, relationships, history
│   │   │   └── uiStore.js                  # Zustand: panels, theme, dialect
│   │   ├── utils/
│   │   │   ├── sqlGenerator.js             # Client-side SQL generation fallback
│   │   │   ├── diagramLayout.js            # Auto-layout algorithm
│   │   │   ├── persistence.js              # localStorage + IndexedDB helpers
│   │   │   └── exportUtils.js             # PNG/PDF export
│   │   ├── hooks/
│   │   │   ├── useAutoSave.js
│   │   │   └── useKeyboardShortcuts.js
│   │   ├── api/
│   │   │   └── apiClient.js               # Axios instance + all API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── generateSql.js
│   │   │   ├── importSql.js
│   │   │   └── ai.js                      # All AI routes
│   │   ├── services/
│   │   │   ├── sqlGeneratorService.js     # Pure logic DDL generation
│   │   │   ├── sqlParserService.js        # SQL → diagram JSON
│   │   │   └── azureOpenAIService.js      # Azure OpenAI client wrapper
│   │   └── index.js                       # Express app entry point
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 10. Non-Functional Requirements

- **Performance**: SQL regeneration debounced at 800ms. AI calls show a loading spinner with cancel option. Canvas handles up to 40 tables smoothly.
- **Error handling**: All AI API errors show a user-friendly toast ("AI is unavailable, try again"). SQL generation errors highlight the problematic node in red.
- **Responsiveness**: The app targets 1280px+ width (laptop/desktop). Not required to be mobile-responsive.
- **No auth required**: No login, no accounts. Everything is local.
- **Loading states**: All AI operations show a pulsing "Thinking..." indicator in the chat panel with a typing animation.

---

## 11. Example Schemas (Built-in)

These should be hardcoded as JSON constants in the frontend and loadable from the Welcome Screen:

1. **E-commerce**: users, products, categories, orders, order_items, payments, addresses
2. **Blog**: users, posts, comments, tags, post_tags, likes
3. **University**: students, courses, instructors, enrollments, departments, grades
4. **Hospital**: patients, doctors, appointments, prescriptions, medications, departments

---

## 12. Deliverable Checklist (for demo)

- [ ] Drag-drop table/column creation on canvas
- [ ] Relationship drawing with type labels
- [ ] SQL DDL generation (MySQL + PostgreSQL toggle)
- [ ] Import SQL → diagram render
- [ ] Natural language → auto-build schema (AI)
- [ ] Schema analysis & normalization advice (AI)
- [ ] Query assistant chat (AI)
- [ ] Save/load diagrams (localStorage + IndexedDB)
- [ ] Export as SQL file
- [ ] Export as PNG
- [ ] Undo/Redo
- [ ] Dark/light mode
- [ ] Welcome screen with example schemas
- [ ] Keyboard shortcuts

---

*End of PRD — paste this entire document into Emergent AI to begin the build.*
