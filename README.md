# Job Hunt Daily

A simple daily job hunting tracker to help you stay consistent with checking job sites.

## Features

- ✅ Track which job sites you've visited today
- 📊 Visual progress indicator
- 🔄 Automatically resets daily
- 🎯 Organized by categories
- 💾 Persists progress in localStorage
- 🏢 **ATS Detection** - Automatically identifies Applicant Tracking Systems (Workday, Greenhouse, Lever, BambooHR)

## ATS Detection

Job Hunt Daily automatically detects which Applicant Tracking System (ATS) each job site uses and displays a color-coded badge:

- 🔵 **Workday (WD)** - Blue badge
- 🟢 **Greenhouse (GH)** - Green badge  
- 🟣 **Lever (LV)** - Purple badge
- 🟠 **BambooHR (BH)** - Orange badge

### Supported ATS Platforms

The app automatically detects ATS from URL patterns:
- **Workday**: `myworkdayjobs.com`, `wd1.`, `wd5.`, `wd501.`
- **Greenhouse**: `greenhouse.io`
- **Lever**: `lever.co`
- **BambooHR**: `bamboohr.com`

### Manual Override

If auto-detection doesn't work or you want to explicitly tag a site, add the `atsType` field to your job site in `job-hunt-daily.json`:

```json
{
  "name": "Company Name",
  "url": "https://company.com/careers",
  "atsType": "workday"
}
```

Hover over any ATS badge to see the full ATS name in a tooltip.

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