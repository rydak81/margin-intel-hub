# Quick Deploy Commands - Copy & Paste

## Step 1: Create GitHub Repo
1. Go to github.com → Click "+" → "New repository"
2. Name: `margin-intel-hub`
3. Private ✓
4. Click "Create repository"
5. **Keep that page open** - you'll need the URL

## Step 2: Terminal Commands

```bash
# Create folder and navigate to it
mkdir margin-intel-hub
cd margin-intel-hub

# Copy your downloaded files here:
# - index.html
# - vercel.json
# - .gitignore
# - sample_articles.json (optional)
# - README.md (optional)

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/margin-intel-hub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Expected result:** Files uploaded to GitHub ✅

## Step 3: Deploy to Vercel

1. Go to **vercel.com**
2. Click **"Continue with GitHub"**
3. Click **"Add New..."** → **"Project"**
4. Find **margin-intel-hub** → Click **"Import"**
5. Click **"Deploy"** (leave all settings default)
6. Wait 30 seconds
7. **Done!** Click "Visit" to see your live site

## Step 4: Load Sample Data

1. Visit your new Vercel URL
2. Press **F12** (opens console)
3. Paste this code:

```javascript
const articles = [
  {
    "id": 1739372800000,
    "date": "2026-02-10",
    "platform": "Amazon",
    "category": "Fees",
    "headline": "Amazon announces 2026 FBA fee updates - average $0.08/unit increase effective Q2",
    "sourceLink": "https://sellercentral.amazon.com/news/fees-2026",
    "summary": ["Average FBA fulfillment fee increase of ~$0.08 per unit effective April 1, 2026", "Inbound placement service fees updated - split shipments now $0.27-$0.40 per unit", "Storage fees adjusted for peak season (Oct-Dec) with 15% increase over 2025"],
    "soWhat": "Pennies become EBITDA problems at scale. For agencies managing 50-100 SKUs per client, this can mean $5-15K in annual margin erosion that nobody notices until retention conversations start. The real issue: most agencies can't explain where profit went.",
    "postAngle": "Amazon fees didn't 'go up a lot'... but that's the problem. Small fee increases compound across inventory. If you run an agency and don't have a margin protection layer, you're leaving retention on the table.",
    "toolMapping": "MarginPro",
    "status": "Saved",
    "postTemplate": "news-action"
  }
];
localStorage.setItem('marginIntelArticles', JSON.stringify(articles));
location.reload();
```

4. Press **Enter**
5. **Test:** Click "Generate Post" on the article

## ✅ You're Live!

Bookmark your Vercel URL and start using it daily!

## 🔄 To Update Later

```bash
# Make changes to files

git add .
git commit -m "Updated feature"
git push

# Vercel auto-deploys in 30 seconds!
```

---

**That's it!** See VERCEL_DEPLOY.md for detailed troubleshooting.
