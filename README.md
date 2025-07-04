# Habit Tracker Bolt

A modern habit tracking application built with React, TypeScript, and Supabase.

## Features

- Track daily habits with a GitHub-like heatmap visualization
- View completion percentages for each habit
- Add, edit, and delete habits
- Toggle between light and dark mode
- View historical data by year

## Tech Stack

- **Frontend**:
  - React + TypeScript
  - Vite build tool
  - Tailwind CSS for styling
  - Lucide React icons
- **Backend**:
  - Supabase for database and authentication
- **Other**:
  - ESLint for code quality
  - Prettier for code formatting

## Project Structure

```
habit-tracker-bolt/
├── src/
│   ├── App.tsx            # Main application component
│   ├── main.tsx            # Entry point
│   ├── components/         # Reusable components
│   │   ├── habit-tracker-heatmap.tsx  # Main habit tracking component
│   │   └── ui/             # UI components (buttons, inputs, etc.)
│   ├── lib/
│   │   └── supabase.ts     # Supabase client configuration
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Development Setup

1. **Prerequisites**:

   - Node.js (v18+ recommended)
   - npm or pnpm
   - Supabase account

2. **Install dependencies**:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_KEY=your-supabase-key
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in browser**:
   The app will be available at `http://localhost:5173`

## Deployment

To build for production:

```bash
npm run build
# or
pnpm build
```

The production files will be generated in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

MIT
