# 🌈 Craftland Map Finder by Shizuka

Free Fire Craftland Map Code search and analysis web tool with Light Rainbow theme and YouTube Sub2Unlock lock system.

---

## 🚀 How to Upload to GitHub

Follow these simple steps in your terminal to push this project to GitHub:

```bash
# 1. Initialize git
git init

# 2. Add all files
git add .

# 3. Commit files
git commit -m "Initial commit - Craftland Map Finder by Shizuka"

# 4. Set main branch
git branch -M main

# 5. Add your GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push to GitHub
git push -u origin main
```

---

## ⚡ How to Deploy on Vercel

1. Open [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.
6. The `vercel.json` and `/api/*.ts` serverless functions included in this repo will automatically handle the backend API routes and client-side routing!

---

## 🌐 How to Deploy on Netlify

1. Open [netlify.com](https://www.netlify.com) and log in.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Choose **GitHub** and select your repository.
4. Netlify will read `netlify.toml` automatically:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**.
6. The `netlify.toml` file automatically configures proxying for `/api/map` and `/api/get` as well as SPA redirects!

---

## 💻 Local Development

To run the project on your computer:

```bash
# Install dependencies
npm install

# Start local server (Node + Express + Vite)
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ✨ Features Included

- 🔍 **Live Free Fire Craftland Map Search**: Fetches map title, creator UID, cover image, likes, dislikes, player count, gameplay tags, and match settings.
- 👤 **Creator Profile Analysis**: Displays creator level badges, craftland EXP, public maps, likes, and all other published maps by the creator.
- 🔒 **Strict Sub2Unlock System**: Requires users to subscribe to [@GamingWithShizuka_11421](https://www.youtube.com/@GamingWithShizuka_11421) on YouTube to unlock the tool.
- 🌈 **Light Rainbow Theme**: Vibrant iridescent pastel rainbow background with moving glowing borders, crisp typography, and responsive mobile-ready layout.
- 🌐 **Multi-Platform Support**: Works seamlessly on Vercel, Netlify, Node/Docker, and static GitHub Pages.
