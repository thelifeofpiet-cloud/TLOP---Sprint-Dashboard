# Sprint Dashboard

A clean, minimal dashboard to track your startup sprint progress. Built for [@thelifeofpiet](https://x.com/thelifeofpiet)'s 86-day sprint from Dec 6, 2025 → March 1, 2026.

## Features

- **Sprint Overview**: High-level progress tracking with 5 key goals
- **Daily Focus**: One critical task per day with streak tracking
- **Today's Wins**: Quick wins logging to fight "not doing enough" feeling
- **Workstreams**: Track Pokenomics, Content/Audience, and Tools progress
- **Weekly Milestones**: Commit to 5 goals each week
- **Time Allocation**: Log daily hours with planned vs actual comparison
- **Data Persistence**: All data stored in browser localStorage
- **Export/Import**: Backup your data as JSON

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **localStorage** for data persistence

## Quick Start (Cursor)

### 1. Create New Next.js Project in Cursor

```bash
npx create-next-app@latest sprint-dashboard
# Select:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ App Router
# ❌ src/ directory
# ✅ import alias (@/*)
```

### 2. Replace Files

Copy all the files from this project into your new Cursor project:

- `app/page.tsx` (main dashboard component)
- `app/layout.tsx` (root layout)
- `app/globals.css` (Tailwind + custom styles)
- `package.json` (dependencies)
- `tailwind.config.js` (Tailwind config)
- `tsconfig.json` (TypeScript config)
- `next.config.js` (Next.js config - configured for Railway deployment)
- `postcss.config.js` (PostCSS config)

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Deployment to Railway

### Method 1: Through Railway Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and sign in
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway auto-detects Next.js and will:
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Start the server (`npm start`)
7. Your dashboard will be live at `your-project.railway.app`

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Follow prompts, then visit your dashboard URL
```

## Custom Domain Setup (sprint-dashboard.thelifeofpiet.com)

### Step 1: Deploy to Railway (see above)

### Step 2: Add Custom Domain in Railway

1. Go to your project in Railway dashboard
2. Click on your service
3. Go to "Settings" → "Domains"
4. Click "Add Domain"
5. Enter: `sprint-dashboard.thelifeofpiet.com`
6. Railway will provide DNS records to configure

### Step 3: Configure DNS

Railway will show you DNS records to add. You typically need to add a **CNAME record**:

**In GoDaddy:**
1. Log in to GoDaddy
2. Go to "My Products" → Find your domain → Click "DNS"
3. Click "Add" → Select "CNAME"
4. Fill in:
   - **Name**: `sprint-dashboard`
   - **Value**: Railway will provide this (usually something like `xxx.railway.app`)
   - **TTL**: 1 hour
5. Click "Save"

**In Namecheap:**
1. Log in to Namecheap
2. Go to "Domain List" → Find your domain → Click "Manage"
3. Go to "Advanced DNS" tab
4. Click "Add New Record" → Select "CNAME Record"
5. Fill in:
   - **Host**: `sprint-dashboard`
   - **Value**: Railway will provide this
   - **TTL**: Automatic
6. Click "Save"

**Alternative: A Record (if Railway provides IP)**
- If Railway provides an A record instead, use that with the IP address

### Step 4: Wait for DNS Propagation

- Usually takes 5-30 minutes
- Sometimes up to 24 hours
- Check status in Railway dashboard
- Verify with: `nslookup sprint-dashboard.thelifeofpiet.com`

### Step 5: Enable HTTPS

Railway automatically provisions SSL certificate once DNS is verified. Your dashboard will be live at:

**https://sprint-dashboard.thelifeofpiet.com** 🚀

### Railway Environment Variables

If you need to add environment variables later:

1. Go to your service in Railway
2. Click "Variables" tab
3. Add any required environment variables
4. Railway will automatically redeploy

## Customization

### Update Your Sprint Dates & Goals

Edit `app/page.tsx` line 74-90:

```typescript
const initialData: SprintData = {
  sprintConfig: {
    startDate: '2025-12-06',  // Your start date
    endDate: '2026-03-01',    // Your end date
    goals: {
      followers: { current: 41, target: 700 },  // Adjust targets
      freeUsers: { current: 0, target: 250 },
      paidUsers: { current: 0, target: 10 },
      mrr: { current: 0, target: 875 },
      toolsReleased: { current: 1, target: 5 }
    }
  },
  // ... rest of config
};
```

### Update Pokenomics Checklist

Edit `app/page.tsx` line 144-153:

```typescript
pokenomics: {
  checklist: [
    { task: 'Your custom task', done: false },
    // Add your own launch checklist items
  ]
}
```

### Change Color Scheme

Edit `app/globals.css` and the progress bar colors in `app/page.tsx` (search for `bg-blue-600`, `bg-green-600`, etc.)

## Data Management

### Export Your Data

Click "Export Data" button in the header. Downloads a JSON file with all your progress.

### Import Data

Click "Import Data" button and select your previously exported JSON file.

### Reset Dashboard

To start fresh:
1. Open browser DevTools (F12)
2. Go to "Application" tab
3. Find "Local Storage"
4. Delete `sprintDashboard` key
5. Refresh page

## Content Strategy

Use this dashboard as content for @thelifeofpiet:

**Day 1 Post:**
"I built a Sprint Dashboard to track my 86-day startup journey. Completely free, no login, works in your browser. Try it: sprint-dashboard.thelifeofpiet.com"

**Weekly Updates:**
"Week 1 of my sprint: ✅ 3/5 milestones hit. 🔥 7-day focus streak. ⏰ 42h on Pokenomics, 15h on content. Full transparency: sprint-dashboard.thelifeofpiet.com"

**Feature Announcements:**
"Added 'Today's Wins' to the Sprint Dashboard. Small wins matter. Track yours: sprint-dashboard.thelifeofpiet.com"

## Troubleshooting

### Dashboard not loading?

- Clear browser cache
- Check browser console for errors (F12)
- Make sure JavaScript is enabled

### Data disappeared?

- Check if you cleared browser data
- Import from a previous export if available
- localStorage is per-domain (data won't transfer between localhost and production)

### Deployment failing?

- Make sure all files are committed to GitHub
- Check Railway build logs for specific errors (in Railway dashboard → Deployments)
- Verify `next.config.js` is configured correctly (Railway runs Next.js as a server, no static export needed)
- Ensure `package.json` has correct build and start scripts

### DNS not working?

- Wait 24 hours for propagation
- Verify CNAME record matches Railway's provided value
- Check DNS with: `nslookup sprint-dashboard.thelifeofpiet.com`
- Railway dashboard will show domain verification status

## Future Enhancements (V2+)

- Cloud sync (Supabase backend)
- Twitter API integration (auto-pull follower count)
- Analytics charts (trends over time)
- Mobile app version
- Collaboration mode (share with accountability partner)
- Weekly digest email
- Habit tracker integration

## Contributing

This is an open-source project. Feel free to:
- Fork it
- Customize it for your own sprint
- Share improvements

## License

MIT License - Use it however you want!

## Credits

Built by [@thelifeofpiet](https://x.com/thelifeofpiet) with Claude AI and Cursor.

Part of the build-in-public journey documenting the creation of Pokenomics and other startups.

---

**Ship fast. Track progress. Build in public.** 🚀
