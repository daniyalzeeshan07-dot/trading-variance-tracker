# Trading Variance Tracker

A Next.js web application for tracking trading variances and analyzing strategy profitability.

## Features

- 📊 **Log Trades** - Record expected vs actual returns/prices
- 📈 **Strategy Analysis** - See which trading strategies are profitable
- 💾 **Persistent Storage** - Data saved automatically in browser
- 📥 **Export Data** - Download trade history as CSV
- 📱 **Responsive Design** - Works on desktop and mobile

## Quick Start

### Option 1: Deploy to Vercel (Recommended)

The easiest way to deploy this app is on Vercel (takes 2 minutes):

#### Step 1: Create a GitHub Account (if you don't have one)
- Go to https://github.com and sign up

#### Step 2: Upload Code to GitHub
1. Go to https://github.com/new to create a new repository
2. Name it `trading-variance-tracker`
3. Click "Create repository"
4. You'll see a page with commands. Copy all the files from the `/trading-tracker` folder:
   - `package.json`
   - `next.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `.gitignore`
   - `pages/` folder (all files inside)
   - `styles/` folder (all files inside)

5. Follow the GitHub instructions to push these files to your new repository

#### Step 3: Deploy to Vercel
1. Go to https://vercel.com and click "Sign Up"
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "New Project"
5. Find and select your `trading-variance-tracker` repository
6. Click "Import"
7. Click "Deploy"
8. Wait 1-2 minutes for deployment to complete
9. Your app is now live! You'll get a URL like `https://trading-variance-tracker-xxx.vercel.app`

### Option 2: Local Development

If you want to run this locally:

#### Prerequisites
- Node.js 16+ installed (download from https://nodejs.org)

#### Steps
1. Extract all the files to a folder called `trading-tracker`
2. Open terminal/command prompt and navigate to that folder
3. Run these commands:

```bash
npm install
npm run dev
```

4. Open http://localhost:3000 in your browser
5. Your app is running!

## How to Use

1. **Log a Trade**
   - Fill in the form with your trade details
   - Required: Symbol and at least one expected value
   - Optional: Strategy name, notes, quantity
   - Click "Add Trade"

2. **View Trade History**
   - Stay on the "Trade Log" tab
   - See all your trades in a table
   - Click "Delete" to remove a trade

3. **Analyze Strategies**
   - Click "Strategy Analysis" tab
   - See profitability breakdown for each strategy
   - Strategies are ranked by total profit
   - View metrics like win rate, best/worst trades

4. **Export Data**
   - Click "Export CSV" button
   - Download your trade history for further analysis

## Data Storage

Your data is stored locally in your browser using browser storage. It persists across sessions but is specific to your computer/browser. If you clear your browser data, trades will be deleted.

## Files Structure

```
trading-tracker/
├── pages/
│   ├── _app.js          # Next.js app wrapper
│   ├── _document.js     # HTML document structure
│   └── index.js         # Main trading tracker page
├── styles/
│   └── globals.css      # Global styling
├── package.json         # Dependencies
├── next.config.js       # Next.js config
├── tailwind.config.js   # Tailwind CSS config
├── postcss.config.js    # PostCSS config
└── .gitignore          # Git ignore rules
```

## Technology Stack

- **Next.js** - React framework
- **React** - UI library
- **Tailwind CSS** - Styling
- **Vercel** - Hosting platform

## Troubleshooting

### App won't deploy to Vercel
- Make sure all files are uploaded to GitHub
- Check that you're pushing to the main/master branch
- Go to your Vercel project settings and redeploy

### Data not saving
- Make sure your browser allows localStorage
- Check that you're not in private/incognito mode
- Try a different browser

### localhost not working locally
- Make sure Node.js is installed: `node --version`
- Try deleting `node_modules` folder and running `npm install` again
- Try a different port: `npm run dev -- -p 3001`

## Support

For issues or questions, check:
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs

## License

MIT
