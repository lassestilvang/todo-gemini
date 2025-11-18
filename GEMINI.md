# Project Overview:
This is a modern, professional daily task planner built with Next.js 14, TypeScript, and Tailwind CSS. It features robust task and list management, an intuitive UI, and adherence to specified technical and design requirements. The application uses a local SQLite database for data persistence, Zustand for state management, and `shadcn/ui` for UI components. Key features include:
*   **Lists:** Inbox and custom lists with customizable colors and emojis.
*   **Tasks:** Comprehensive fields including name, description, dates (date, deadline), estimate, priority, completion status, recurring settings, sub-tasks, and history logging.
*   **Views:** Dedicated views for "Today", "Next 7 Days", "Upcoming", and "All" tasks, with the ability to toggle visibility of completed tasks and highlight overdue tasks.
*   **Search:** Fuzzy search functionality for tasks.
*   **UI/UX:** Responsive split-view layout (Sidebar + Main panel), minimalistic dark mode with vibrant colors, and light/dark theme switching. Animations are implemented using Framer Motion, and page transitions leverage the View Transition API.

# Technical Stack:
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript (strict)
*   **Package Manager:** Bun
*   **Styling:** Tailwind CSS v4, `shadcn/ui`
*   **State Management:** Zustand
*   **Database:** Local SQLite (`todo.db`) via `sqlite` and `sqlite3` packages
*   **Animations:** Framer Motion
*   **Form Validation:** `react-hook-form` with `zod`
*   **Date Manipulation:** `date-fns`
*   **Unique IDs:** `cuid`
*   **Theming:** `next-themes`

# Architecture:
The application follows a client-server architecture typical of Next.js applications.
*   **Frontend:** React components (client and server components) using `zustand` for client-side state.
*   **Backend (API Routes):** Next.js API routes (`/api/lists`, `/api/tasks`, `/api/tasks/[id]`, `/api/tasks/today`, `/api/tasks/next-7-days`, `/api/tasks/upcoming`, `/api/tasks/search`) handle CRUD operations and data fetching from the SQLite database.
*   **Database Layer:** `src/lib/db.ts` provides functions for connecting to SQLite, initializing tables, and complex queries like fetching tasks with subtasks.

# Building and Running:

*   **Install dependencies:**
    ```bash
    bun install
    ```
*   **Initialize the database (creates `todo.db` and tables):**
    ```bash
    bun run db:init
    ```
*   **Seed the database with initial data (e.g., "Inbox" list):**
    ```bash
    bun run db:seed
    ```
*   **Run the development server:**
    ```bash
    bun dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.
*   **Build for production:**
    ```bash
    bun run build
    ```
*   **Start production server:**
    ```bash
    bun run start
    ```
*   **Run linting:**
    ```bash
    bun run lint
    ```
*   **Run unit tests:**
    ```bash
    bun test
    ```
    (Specific tests can be run, e.g., `bun test src/lib/utils.test.ts`)

# Development Conventions:
*   **TypeScript:** Strict TypeScript usage for type safety.
*   **Styling:** Tailwind CSS for utility-first styling, with `shadcn/ui` components.
*   **State Management:** Zustand for managing global and component-specific state.
*   **API Routes:** Next.js API routes are used for backend interactions with the SQLite database.
*   **Responsive Design:** Application is designed to be responsive across different screen sizes, utilizing Tailwind's responsive utilities and a mobile-friendly sidebar.
*   **Animations:** Framer Motion is used for UI animations, and the View Transition API for page transitions.
*   **Form Handling:** `react-hook-form` and `zod` are used for robust form validation.
