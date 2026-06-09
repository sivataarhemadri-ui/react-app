# React App (Vite)

Quick steps to install and run the project on macOS (zsh).

1) Make sure Node.js (v18+) and npm are installed. Check versions:

```bash
node -v
npm -v
```

2) Install dependencies (from project root `react-app`):

```bash
cd "~/Library/Containers/maccatalyst.com.frontrow.vlog/Data/Documents/FRVideoEditor/Material/untitled folder/react-app"
npm install
```

3) Start the dev server:

```bash
npm run dev
```

This opens the Vite dev server (usually at http://localhost:5173). To build for production:

```bash
npm run build
npm run preview
```

Notes:
- If you prefer yarn or pnpm, you can run `yarn` or `pnpm install` instead.
- If Node is older than v18, please upgrade using nvm or Homebrew.
