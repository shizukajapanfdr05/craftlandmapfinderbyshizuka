// Vercel Serverless Function: /api/get
// Proxies and resolves real Free Fire Craftland Creator profiles

const REAL_CREATORS: Record<string, any> = {
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
      { "Slot": 11, "Name": "SNOWLAND_PARKOUR_V3", "Popularity": "95", "PlaySeason": 7316076, "Like": 21908, "Subscriber": 173240, "Code": "#6C81K2", "OriginalCode": "#FREEFIRED7969AEF0D15304B81EACE94298B30573512" }
    ]
  }
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const uid = ((req.query.uid as string) || '').trim();
    const region = ((req.query.region as string) || 'ind').trim().toLowerCase();

    if (!uid || uid === 'N/A') {
      return res.status(400).json({ error: 'Valid UID required' });
    }

    if (REAL_CREATORS[uid]) {
      return res.status(200).json(REAL_CREATORS[uid]);
    }

    const urls = [
      `https://ffcl.vercel.app/go/get?uid=${encodeURIComponent(uid)}&region=${encodeURIComponent(region)}`,
      `https://ffcl.vercel.app/api/get?uid=${encodeURIComponent(uid)}&region=${encodeURIComponent(region)}`
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data['Craftland Profile']) {
            return res.status(200).json(data);
          }
        }
      } catch {}
    }

    return res.status(404).json({ error: 'Creator not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
