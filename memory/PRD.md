# SketchSQL — Product Requirements Document

## Project Overview
SketchSQL is a visual database schema designer with an integrated AI assistant. Users drag-and-drop entities onto a canvas to build ER diagrams, define columns and relationships, and instantly generate production-ready SQL DDL.

**Elevator pitch:** "Draw your database. Get your SQL. Ask AI anything about it."

---

## Architecture

### Tech Stack
- **Frontend**: React (CRA), ReactFlow v11, Monaco Editor, Zustand, Tailwind CSS, react-hot-toast
- **Backend**: Python FastAPI (port 8001, supervisor-managed) — implements same API contract as PRD's Node.js spec
- **AI**: Azure OpenAI GPT-5.4 via `openai` Python SDK with AzureOpenAI client
- **Persistence**: localStorage (autosave) + IndexedDB (named saves) — no backend DB

### Environment
- Backend: `/app/backend/server.py` — FastAPI with all API routes
- Frontend: `/app/frontend/src/` — React CRA
- Azure OpenAI env vars: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`

---

## Implemented Features (2025-01-01)

### Core Canvas
- [x] Three-panel layout: Left sidebar (220px) + Center canvas (flex) + Right panel (360px)
- [x] ReactFlow canvas with custom TableNode and RelationshipEdge types
- [x] Add table via toolbar button or double-click canvas
- [x] Drag-drop table repositioning
- [x] Table node: colored header, column rows with PK/UQ/NN badges, inline column editor
- [x] Column inline editor: name, type (16 types), PK, AI, NOT NULL, UNIQUE, default value, delete
- [x] Context menu on table node: Rename, Add Column, Set Color (6 colors), Delete
- [x] Relationship edges with type labels (1:1, 1:N, M:N)
- [x] Connect columns by dragging handles (source/target per column)
- [x] Edge click → Properties tab → type, ON DELETE, ON UPDATE selectors
- [x] Undo/Redo (50-state history stack)
- [x] Ctrl+Z/Ctrl+Shift+Z keyboard shortcuts
- [x] Ctrl+S → Save dialog, Ctrl+D → Duplicate table, Delete → Delete selected

### SQL Generation
- [x] Client-side SQL generation (debounced 800ms, instant)
- [x] Server-side SQL generation via /api/generate-sql
- [x] MySQL DDL: backtick identifiers, AUTO_INCREMENT, ENGINE=InnoDB
- [x] PostgreSQL DDL: quoted identifiers, SERIAL/BIGSERIAL, native BOOLEAN
- [x] FK constraints with ON DELETE/ON UPDATE
- [x] Many-to-many junction table auto-generation
- [x] Topological sort for FK dependency ordering
- [x] Monaco Editor (vs-dark theme) with syntax highlighting
- [x] Copy to clipboard, Download .sql file

### Dialect Toggle
- [x] MySQL / PostgreSQL toggle in header
- [x] Immediate SQL regeneration on dialect switch

### Import SQL
- [x] Import SQL modal with textarea
- [x] Backend parser: CREATE TABLE, PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, AUTO_INCREMENT, SERIAL
- [x] Auto-layout imported tables on canvas

### Save / Load / Export
- [x] Auto-save to localStorage every 2 seconds
- [x] Named saves to IndexedDB (up to 50 diagrams)
- [x] Left panel: saved diagrams list with date, table count
- [x] Rename/delete via right-click context menu
- [x] Load diagram from left panel click
- [x] Export: SQL (.sql), JSON (.json), PNG, PDF

### AI Features
- [x] Natural Language → Schema generation via /api/ai/generate-schema
- [x] Auto-layout generated schemas
- [x] Replace/merge confirmation when canvas has existing content
- [x] Schema analysis via /api/ai/analyze-schema (normalization advice)
- [x] Multi-turn query assistant chat via /api/ai/chat
- [x] Schema context sent with every AI request
- [x] Markdown rendering in chat bubbles
- [x] Example prompt chips
- [x] Typing indicator (animated dots)
- [x] Clear chat button

### Welcome Screen
- [x] Start from scratch, Try an example, Describe with AI
- [x] 4 built-in example schemas: E-commerce, Blog, University, Hospital

### Properties Panel
- [x] Table selected: name, color, all columns with full editor
- [x] Edge selected: relationship type, ON DELETE, ON UPDATE

### Theme
- [x] Dark mode (default, VS Code/Cursor-inspired design)
- [x] Light mode toggle

### Canvas Controls
- [x] Zoom in/out
- [x] Fit View button
- [x] Minimap (toggleable)
- [x] Grid dots (toggleable)

---

## Backend API Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/ | Health check |
| POST | /api/generate-sql | Diagram JSON → SQL DDL |
| POST | /api/import-sql | SQL string → diagram JSON |
| POST | /api/ai/generate-schema | NL prompt → schema JSON |
| POST | /api/ai/analyze-schema | Schema → analysis markdown |
| POST | /api/ai/chat | Multi-turn chat with schema context |

---

## Implemented Features — Update 2026-02 (P1 batch)

### Canvas & UX Enhancements
- [x] **Ctrl+A / Cmd+A** keyboard shortcut to select all tables (wired via `useKeyboardShortcuts` hook)
- [x] **Select All** toolbar button (`select-all-btn`) in CanvasToolbar
- [x] **Snap-to-grid toggle** (`toggle-snap-btn`) — snapGrid=[20,20] applied to ReactFlow
- [x] **M:N junction table toast** — when relationship type is changed to `many-to-many`, a persistent toast offers an `Auto-create junction table` button which spawns a properly-named junction table with composite PK and redirects both FK edges
- [x] **ERD → ORM code generation** — new **ORM** tab in right panel supporting **Django models.py**, **Prisma schema.prisma**, and **SQLAlchemy** (declarative base); read-only Monaco editor with Copy & Download buttons
- [x] README.md at `/app/README.md` documenting setup, features, and API contract

## Prioritized Backlog (P0/P1/P2)

### P0 (Critical for demo)
- [ ] Verify AI chat with real Azure OpenAI key under sustained load
- [ ] Test large diagrams (20+ tables) performance (ReactFlow render, SQL debounce)

### P1 (Enhancement)
- [ ] Relationship label editing (custom FK name)
- [ ] Verify Export PDF/PNG from header under various zoom levels
- [ ] Dark/light theme: tune Monaco ORM editor light theme

### P2 (Nice to have)
- [ ] Collaborative editing
- [ ] Version history (beyond undo stack)
- [ ] Template marketplace
- [ ] ORM generation: TypeORM, Sequelize, Laravel Eloquent
- [ ] Schema diff / migration generation between diagram versions
