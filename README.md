# Daily Task Planner

A modern, professional daily task planner built with Next.js 14, TypeScript, and Tailwind CSS. This application helps users manage their tasks and lists efficiently with an intuitive user interface and robust features.

## ✨ Features

*   **Lists:** Create and manage custom lists, including a default "Inbox", with customizable colors and emojis.
*   **Tasks:** Comprehensive task management with fields for name, description, due dates (date, deadline), estimated time, priority levels, completion status, recurring settings, sub-tasks, and a detailed history log of changes.
*   **Views:** Organize and prioritize your day with dedicated views for:
    *   **Today:** Tasks due today.
    *   **Next 7 Days:** Tasks scheduled for the upcoming week.
    *   **Upcoming:** All future tasks.
    *   **All Tasks:** A comprehensive list of all tasks.
*   **Filtering:** Toggle the visibility of completed tasks in any view.
*   **Overdue Highlighting:** Visually identify overdue tasks for better prioritization.
*   **Sub-tasks:** Break down larger tasks into smaller, manageable sub-tasks.
*   **Task History:** Track all modifications made to a task.
*   **Fuzzy Search:** Quickly find tasks by name or description.
*   **Intuitive UI/UX:**
    *   Responsive split-view layout (Sidebar + Main panel) for optimal experience across devices.
    *   Minimalistic dark mode with vibrant accent colors.
    *   Seamless light/dark theme switching.
    *   Smooth UI animations powered by Framer Motion and modern page transitions using the View Transition API.

## 🚀 Technical Stack

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

## 🏗️ Architecture

The application employs a client-server architecture leveraging Next.js capabilities:

*   **Frontend:** Built with React components (both Client and Server Components) for a dynamic and efficient user interface. Zustand manages client-side application state.
*   **Backend (API Routes):** Next.js API routes (`/api/lists`, `/api/tasks`, `/api/tasks/[id]`, `/api/tasks/today`, `/api/tasks/next-7-days`, `/api/tasks/upcoming`, `/api/tasks/search`) handle all CRUD operations and data fetching, interacting directly with the database.
*   **Database Layer:** A dedicated `src/lib/db.ts` module provides a clean abstraction for SQLite database connections, table initialization, and complex data retrieval logic, including fetching tasks with their nested sub-tasks.

## ⚙️ Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have [Bun](https://bun.sh/docs/installation) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd todo-gemini
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Database Setup

1.  **Initialize the database:** This creates the `todo.db` file and sets up the necessary `lists`, `tasks`, and `task_history` tables.
    ```bash
    bun run db:init
    ```
2.  **Seed initial data (optional):** This will add a default "Inbox" list to your database.
    ```bash
    bun run db:seed
    ```

### Running the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📦 Building for Production

To create an optimized production build:

```bash
bun run build
```

To start the production server:

```bash
bun run start
```

## 🧪 Testing

*   **Run linting checks:**
    ```bash
    bun run lint
    ```
*   **Run unit tests:**
    ```bash
    bun test
    ```
    You can run specific test files, for example:
    ```bash
    bun test src/lib/utils.test.ts
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📄 License

[MIT License](LICENSE) - *Note: A `LICENSE` file would typically be present in the root directory.*