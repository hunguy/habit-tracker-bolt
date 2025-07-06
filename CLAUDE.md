# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Tasks

- **Install Dependencies**: `npm install` or `pnpm install`
- **Run Development Server**: `npm run dev` or `pnpm dev`
- **Build for Production**: `npm run build` or `pnpm build`
- **Run Linter**: `npm run lint`

## High-Level Code Architecture and Structure

This is a React and TypeScript application built with Vite, styled using Tailwind CSS, and uses Supabase for the backend.

- **`src/`**: Contains all source code.
  - **`App.tsx`**: The main application component. It sets up a `ThemeProvider` for light/dark mode and renders `HabitTrackerApp`.
  - **`main.tsx`**: The entry point of the React application.
  - **`components/`**: Contains reusable React components.
    - **`habit-tracker-heatmap.tsx`**: The core component for habit tracking, responsible for displaying habits, managing their state, interacting with Supabase, and rendering the heatmap visualization.
    - **`ui/`**: Houses generic UI components (e.g., `Button`, `Input`, `Card`, `Select`, `Badge`) built with `@radix-ui/react-select`, `class-variance-authority`, `clsx`, `lucide-react`, `tailwind-merge`, and `tailwindcss-animate`.
  - **`lib/`**: Utility files.
    - **`supabase.ts`**: Configures the Supabase client using environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`).
    - **`utils.ts`**: Contains general utility functions.
  - **`index.css`**: Global CSS styles, including Tailwind CSS imports.

## Data Flow and State Management

- **Habit and Habit Entries**: Data is stored and managed via Supabase. The `habit_tracker-heatmap.tsx` component handles fetching, adding, updating, and deleting habits and their completion dates with the `supabase` client.
- **Theming**: A `ThemeContext` is provided by `App.tsx` to manage light/dark mode. The `useTheme` hook allows components to access and toggle the current theme, which is persisted in local storage.

## External Services Integration

- **Supabase**: Used for database (habits and habit entries) and authentication. Environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are used for configuration.
