# Job Hunt Daily

A simple daily job hunting tracker to help you stay consistent with checking job sites.

## Features

- ✅ Track which job sites you've visited today
- 📊 Visual progress indicator
- 🔄 Automatically resets daily
- 🎯 Organized by categories
- 💾 Persists progress in localStorage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

4. Run tests with UI:
```bash
npm run test:ui
```

5. Run tests with coverage:
```bash
npm run test:coverage
```

## Configuration

Edit `src/data/job-hunt-daily.json` to customize your job sites:

```json
{
  "categories": [
    {
      "name": "Job Boards",
      "sites": [
        {
          "name": "LinkedIn Jobs",
          "url": "https://www.linkedin.com/jobs/"
        }
      ]
    }
  ]
}
```

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- shadcn-vue
- Vitest

## How It Works

1. Click on any job site link to mark it as visited
2. Links open in new tabs
3. Progress is saved and resets automatically at midnight
4. Complete all sites to see your completion message!