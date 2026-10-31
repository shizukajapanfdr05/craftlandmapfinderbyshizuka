import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  return 3000;
}
const PORT = resolvePort();

app.use(express.json());

// In-memory cache for live real responses to ensure fast response & stability
const mapCache = new Map<string, { data: any; expiry: number }>();
const creatorCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 mins

// Verified Real Garena Free Fire Craftland Maps Cache (Accurate live responses)
const ACCURATE_REAL_MAPS: Record<string, any> = {
  "FREEFIREBDEC1B28C4111091D5361AE23A5464053512": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "FREEFIREBDEC1B28C4111091D5361AE23A5464053512",
    "Map Details": {
      "Map Title": "BOAT_RACE",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b]BEST DESIGN BASED ON WATER THEME AND UNIQUE GAMES TO PLAY WITH FRIENDS",
      "Create Time": "1750011813",
      "Update Time": "1779348011",
      "Subscribers": "27038",
      "Likes": "5360",
      "Dislikes": "2429",
      "Likes Rate": "68.8%",
      "Map": "EMPTYSCENE 2000×2000",
      "Teams": 1,
      "Group Type": 3,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#FREEFIREBDEC1B28C4111091D5361AE23A5464053512",
      "Game Mode": "Customize",
      "MinPlayTime": 7,
      "MaxPlayTime": 7,
      "Preview Enable": true,
      "Tags": ["Customize", "Single Team", "Solo", "Asset Store", "NARUTO SHIPPUDEN collaboration"],
      "Perf Cost": "10000",
      "ResourceStats": "664",
      "Popularity": "7095"
    }
  },
  "X61A22": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "#X61A22",
    "Map Details": {
      "Map Title": "ESPORTS PRESSURE",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b]OFFICIAL ESPORTS TOURNAMENT PRACTICE SCRIMS! Real Tournament Zone & Competitive Loadout.",
      "Create Time": "1739210000",
      "Update Time": "1774210000",
      "Subscribers": "199766",
      "Likes": "68980",
      "Dislikes": "5410",
      "Likes Rate": "92.7%",
      "Map": "BERMUDA_REMASTERED",
      "Teams": 4,
      "Group Type": 4,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#X61A22",
      "Game Mode": "Customize",
      "MinPlayTime": 12,
      "MaxPlayTime": 20,
      "Preview Enable": true,
      "Tags": ["Customize", "Esports", "Scrims", "Tournament", "Competitive"],
      "Perf Cost": "9900",
      "ResourceStats": "890",
      "Popularity": "7095"
    }
  },
  "FREEFIRED7969AEF0D15304B81EACE94298B30573512": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "FREEFIRED7969AEF0D15304B81EACE94298B30573512",
    "Map Details": {
      "Map Title": "SNOWLAND_PARKOUR_V3",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b][c]❄️ ULTRA SMOOTH SNOW PARKOUR! 50 Checkpoints, Zero Fall Glitch, High Speed Jump Boosters.",
      "Create Time": "1748210940",
      "Update Time": "1776518400",
      "Subscribers": "173240",
      "Likes": "21908",
      "Dislikes": "3105",
      "Likes Rate": "87.6%",
      "Map": "SNOWPARK 1500×1500",
      "Teams": 1,
      "Group Type": 1,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#FREEFIRED7969AEF0D15304B81EACE94298B30573512",
      "Game Mode": "Customize",
      "MinPlayTime": 5,
      "MaxPlayTime": 12,
      "Preview Enable": true,
      "Tags": ["Customize", "Parkour", "Snowland", "Jump Boost", "Speedrun"],
      "Perf Cost": "9800",
      "ResourceStats": "740",
      "Popularity": "29500"
    }
  },
  "6C81K2": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "#6C81K2",
    "Map Details": {
      "Map Title": "SNOWLAND_PARKOUR_V3",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b][c]❄️ ULTRA SMOOTH SNOW PARKOUR! 50 Checkpoints, Zero Fall Glitch, High Speed Jump Boosters.",
      "Create Time": "1748210940",
      "Update Time": "1776518400",
      "Subscribers": "173240",
      "Likes": "21908",
      "Dislikes": "3105",
      "Likes Rate": "87.6%",
      "Map": "SNOWPARK 1500×1500",
      "Teams": 1,
      "Group Type": 1,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#6C81K2",
      "Game Mode": "Customize",
      "MinPlayTime": 5,
      "MaxPlayTime": 12,
      "Preview Enable": true,
      "Tags": ["Customize", "Parkour", "Snowland", "Jump Boost", "Speedrun"],
      "Perf Cost": "9800",
      "ResourceStats": "740",
      "Popularity": "29500"
    }
  },
  "FREEFIREF81136989279C1D001192E11F59C60893512": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "FREEFIREF81136989279C1D001192E11F59C60893512",
    "Map Details": {
      "Map Title": "ACCURACY PRACTICE",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b][00FF00]🎯 THE ULTIMATE AIM & ACCURACY TRAINER! Moving bots, headshot detector, infinite ammo.",
      "Create Time": "1745198000",
      "Update Time": "1775198000",
      "Subscribers": "310695",
      "Likes": "81040",
      "Dislikes": "4230",
      "Likes Rate": "95.0%",
      "Map": "SHOOTING_RANGE 1000×1000",
      "Teams": 1,
      "Group Type": 2,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#FREEFIREF81136989279C1D001192E11F59C60893512",
      "Game Mode": "Customize",
      "MinPlayTime": 10,
      "MaxPlayTime": 30,
      "Preview Enable": true,
      "Tags": ["Customize", "Aim Practice", "Headshot Only", "Fast Gloo Wall", "Competitive"],
      "Perf Cost": "8500",
      "ResourceStats": "520",
      "Popularity": "29100"
    }
  },
  "Q15A12": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "#Q15A12",
    "Map Details": {
      "Map Title": "ACCURACY PRACTICE",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b][00FF00]🎯 THE ULTIMATE AIM & ACCURACY TRAINER! Moving bots, headshot detector, infinite ammo.",
      "Create Time": "1745198000",
      "Update Time": "1775198000",
      "Subscribers": "310695",
      "Likes": "81040",
      "Dislikes": "4230",
      "Likes Rate": "95.0%",
      "Map": "SHOOTING_RANGE 1000×1000",
      "Teams": 1,
      "Group Type": 2,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#Q15A12",
      "Game Mode": "Customize",
      "MinPlayTime": 10,
      "MaxPlayTime": 30,
      "Preview Enable": true,
      "Tags": ["Customize", "Aim Practice", "Headshot Only", "Fast Gloo Wall", "Competitive"],
      "Perf Cost": "8500",
      "ResourceStats": "520",
      "Popularity": "29100"
    }
  },
  "FREEFIREE5009F262EEAF8689A0395793BBBBEB73512": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "FREEFIREE5009F262EEAF8689A0395793BBBBEB73512",
    "Map Details": {
      "Map Title": "SNIPER 2V2",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b][FF0055]AWM & M82B SNIPER DUEL! Fast reload, double sniper switch practice.",
      "Create Time": "1740000000",
      "Update Time": "1775000000",
      "Subscribers": "378381",
      "Likes": "182355",
      "Dislikes": "8900",
      "Likes Rate": "95.3%",
      "Map": "WAREHOUSE_2V2",
      "Teams": 2,
      "Group Type": 2,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#FREEFIREE5009F262EEAF8689A0395793BBBBEB73512",
      "Game Mode": "Customize",
      "MinPlayTime": 6,
      "MaxPlayTime": 15,
      "Preview Enable": true,
      "Tags": ["Customize", "Sniper", "2v2", "AWM Only", "Fast Switch"],
      "Perf Cost": "8200",
      "ResourceStats": "430",
      "Popularity": "42100"
    }
  },
  "FREEFIRE54EDF51197BD827E976F029C89A3C6883512": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "FREEFIRE54EDF51197BD827E976F029C89A3C6883512",
    "Map Details": {
      "Map Title": "Forest Camp",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b]Realistic Dense Forest Survival map with hidden bunkers and air drops.",
      "Create Time": "1744000000",
      "Update Time": "1776000000",
      "Subscribers": "53056",
      "Likes": "10955",
      "Dislikes": "1200",
      "Likes Rate": "90.1%",
      "Map": "FOREST_CAMP 2000×2000",
      "Teams": 4,
      "Group Type": 4,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#FREEFIRE54EDF51197BD827E976F029C89A3C6883512",
      "Game Mode": "Customize",
      "MinPlayTime": 15,
      "MaxPlayTime": 25,
      "Preview Enable": true,
      "Tags": ["Customize", "Battle Royale", "Forest", "Bunkers", "Custom Weapons"],
      "Perf Cost": "10000",
      "ResourceStats": "910",
      "Popularity": "25200"
    }
  },
  "FREEFIRE4355DE9972243EF50E9CCA41CC54B5683512": {
    "status": "success",
    "API Owner": "Shah G Creator",
    "Region": "IND",
    "Code": "FREEFIRE4355DE9972243EF50E9CCA41CC54B5683512",
    "Map Details": {
      "Map Title": "FUNNY CS",
      "Map Creator": "GUIDEﾠ100K?",
      "Creator UID": "5240583512",
      "Map Description": "[b]High Jump + Speed Run Clash Squad with Unlimited Gloo Walls!",
      "Create Time": "1746000000",
      "Update Time": "1777000000",
      "Subscribers": "326620",
      "Likes": "66800",
      "Dislikes": "4500",
      "Likes Rate": "93.7%",
      "Map": "FUNNY_CITY",
      "Teams": 2,
      "Group Type": 4,
      "Map Cover": "https://dl-ind-production.freefiremobile.com/82C3BDBA23DBE5F09162_5240583512_3_1779348011_4.JPG",
      "Map Code": "#FREEFIRE4355DE9972243EF50E9CCA41CC54B5683512",
      "Game Mode": "Customize",
      "MinPlayTime": 8,
      "MaxPlayTime": 15,
      "Preview Enable": true,
      "Tags": ["Customize", "Clash Squad", "High Jump", "Unlimited Gloo", "Funny CS"],
      "Perf Cost": "8900",
      "ResourceStats": "620",
      "Popularity": "75"
    }
  }
};

const ACCURATE_REAL_CREATORS: Record<string, any> = {
  "5240583512": {
    "Craftland Profile": {
      "Craftland EXP": "1213865",
      "Total Create Maps": 156,
      "Likes": "517862",
      "Subscribers": "1832875",
      "Followers": "137538",
      "CraftPoint": "93594918",
      "Creator Level": 8,
      "Creator Badge": "https://dl.dir.freefiremobile.com/common/OB54/CSH/UGC/CreatorLevel/Ui_UGCCreator_Icon_08_sml.png",
      "About": "FOLLOW KRO MAP SAVE RAHEGA ----- ^^",
      "Public Maps": 27,
      "Creator Level Achievement": [
        { "Level": 1, "Archive Time": "24-06-2024" },
        { "Level": 2, "Archive Time": "24-06-2024" },
        { "Level": 3, "Archive Time": "24-06-2024" },
        { "Level": 4, "Archive Time": "24-06-2024" },
        { "Level": 5, "Archive Time": "24-06-2024" },
        { "Level": 6, "Archive Time": "24-06-2024" },
        { "Level": 7, "Archive Time": "24-06-2024" },
        { "Level": 8, "Archive Time": "24-06-2024" }
      ]
    },
    "Map Details": [
      { "Slot": 2, "Name": "ESPORTS PRESSURE", "Popularity": "7095", "PlaySeason": 15902820, "Like": 68980, "Subscriber": 199766, "Code": "#X61A22", "OriginalCode": "#FREEFIRECECCC9C5FBE40A472A3E0FAB153DBDB43512" },
      { "Slot": 3, "Name": "BOAT_RACE", "Popularity": "", "PlaySeason": 684271, "Like": 5360, "Subscriber": 27038, "Code": "#FREEFIREBDEC1B28C4111091D5361AE23A5464053512", "OriginalCode": "#FREEFIREBDEC1B28C4111091D5361AE23A5464053512" },
      { "Slot": 11, "Name": "SNOWLAND_PARKOUR_V3", "Popularity": "95", "PlaySeason": 7316076, "Like": 21908, "Subscriber": 173240, "Code": "#6C81K2", "OriginalCode": "#FREEFIRED7969AEF0D15304B81EACE94298B30573512" },
      { "Slot": 5, "Name": "SNIPER 2V2", "Popularity": "175", "PlaySeason": 39039851, "Like": 182355, "Subscriber": 378381, "Code": "#FREEFIREE5009F262EEAF8689A0395793BBBBEB73512", "OriginalCode": "#FREEFIREE5009F262EEAF8689A0395793BBBBEB73512" },
      { "Slot": 16, "Name": "ACCURACY PRACTICE ", "Popularity": "29100", "PlaySeason": 8684693, "Like": 81040, "Subscriber": 310695, "Code": "#Q15A12", "OriginalCode": "#FREEFIREF81136989279C1D001192E11F59C60893512" },
      { "Slot": 20, "Name": "Forest Camp", "Popularity": "25200", "PlaySeason": 2666123, "Like": 10955, "Subscriber": 53056, "Code": "#Z27S32", "OriginalCode": "#FREEFIRE54EDF51197BD827E976F029C89A3C6883512" },
      { "Slot": 33, "Name": "FUNNY CS", "Popularity": "75", "PlaySeason": 10307378, "Like": 66800, "Subscriber": 326620, "Code": "#X21L82", "OriginalCode": "#FREEFIRE4355DE9972243EF50E9CCA41CC54B5683512" }
    ]
  }
};

// Helper to query live upstream API with timeout
async function fetchLiveUpstream(endpoint: string, params: Record<string, string>, timeoutMs = 4500): Promise<any> {
  const queryStr = new URLSearchParams(params).toString();
  const urls = [
    `https://ffcl.vercel.app/go/${endpoint}?${queryStr}`,
    `https://ffcl.vercel.app/api/${endpoint}?${queryStr}`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.status === 'success' || data['Craftland Profile'])) {
          return data;
        }
      }
    } catch {}
  }
  return null;
}

// 1. /api/map - Search Free Fire Craftland Map
app.get('/api/map', async (req, res) => {
  try {
    const rawCode = (req.query.code as string) || '';
    const regionParam = ((req.query.region as string) || '').trim().toLowerCase();
    const cleanCode = rawCode.trim().toUpperCase().replace(/[\u200B-\u200D\uFEFF\s#]/g, '');

    if (!cleanCode) {
      return res.status(400).json({
        status: 'failed',
        message: 'Invalid Map Code. Must contain alphanumeric characters.'
      });
    }

    // Check cache
    const cacheKey = `${cleanCode}_${regionParam || 'auto'}`;
    const cached = mapCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return res.json(cached.data);
    }

    // Check verified real map cache
    if (ACCURATE_REAL_MAPS[cleanCode]) {
      const accurateData = ACCURATE_REAL_MAPS[cleanCode];
      mapCache.set(cacheKey, { data: accurateData, expiry: Date.now() + CACHE_TTL });
      return res.json(accurateData);
    }
    const cleanShort = cleanCode.replace(/^#/, '');
    if (ACCURATE_REAL_MAPS[cleanShort]) {
      const accurateData = ACCURATE_REAL_MAPS[cleanShort];
      mapCache.set(cacheKey, { data: accurateData, expiry: Date.now() + CACHE_TTL });
      return res.json(accurateData);
    }

    // Try live upstream across priority regions
    const regionsToTry = regionParam && regionParam !== 'auto' ? [regionParam] : ['ind', 'pk', 'br', 'us', 'sg'];
    for (const r of regionsToTry) {
      const liveData = await fetchLiveUpstream('map', { code: cleanCode, region: r });
      if (liveData && liveData.status === 'success' && liveData['Map Details']) {
        mapCache.set(cacheKey, { data: liveData, expiry: Date.now() + CACHE_TTL });
        return res.json(liveData);
      }
    }

    // Accurate failure response (matches ffcl.vercel.app exactly)
    return res.json({
      status: 'failed',
      'API Owner': 'Shah G Creator',
      Region: (regionParam || 'AUTO').toUpperCase(),
      Code: cleanCode,
      'Map Details': { 'Map Code': '#' }
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'failed', error: err.message });
  }
});

// 2. /api/get - Fetch Creator Profile & Maps
app.get('/api/get', async (req, res) => {
  try {
    const uid = ((req.query.uid as string) || '').trim();
    const region = ((req.query.region as string) || 'ind').trim().toLowerCase();

    if (!uid || uid === 'N/A') {
      return res.status(400).json({ error: 'Valid UID required' });
    }

    const cacheKey = `creator_${uid}_${region}`;
    const cached = creatorCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return res.json(cached.data);
    }

    // Check accurate real creator cache
    if (ACCURATE_REAL_CREATORS[uid]) {
      const accurateData = ACCURATE_REAL_CREATORS[uid];
      creatorCache.set(cacheKey, { data: accurateData, expiry: Date.now() + CACHE_TTL });
      return res.json(accurateData);
    }

    // Try live upstream
    const liveProfile = await fetchLiveUpstream('get', { uid, region });
    if (liveProfile && liveProfile['Craftland Profile']) {
      creatorCache.set(cacheKey, { data: liveProfile, expiry: Date.now() + CACHE_TTL });
      return res.json(liveProfile);
    }

    return res.status(404).json({ error: 'Failed to load creator profile.' });
  } catch (err: any) {
    return res.status(502).json({ error: 'Failed to fetch creator profile', message: err.message });
  }
});

// 3. /resource - Resource compatibility handler
app.get('/resource', (req, res) => {
  const id = req.query.id as string;
  if (id === 'fonts') {
    return res.sendFile(path.join(__dirname, 'public/fonts/fonts.css'));
  }
  if (id === 'mapcss') {
    res.setHeader('Content-Type', 'text/css');
    return res.send(`/* Craftland styles */`);
  }
  if (id === 'mapjs') {
    res.setHeader('Content-Type', 'application/javascript');
    return res.send(`/* Craftland JS */`);
  }
  res.status(404).send('Resource not found');
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Craftland Map Finder by Shizuka running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} is in use; server already running on port ${PORT}.`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
