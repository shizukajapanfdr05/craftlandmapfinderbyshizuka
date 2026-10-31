/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

// Target YouTube Channel
const YT_CHANNEL_URL = 'https://www.youtube.com/@GamingWithShizuka_11421?sub_confirmation=1';
const YT_CHANNEL_NAME = 'Gaming With Shizuka';

// Region definitions matching ffcl.vercel.app
const REGIONS = [
  { value: '', label: '🌐 Auto Detect Region' },
  { value: 'pk', label: '🇵🇰 Pakistan' },
  { value: 'ind', label: '🇮🇳 India' },
  { value: 'br', label: '🇧🇷 Brazil' },
  { value: 'us', label: '🇺🇸 USA' },
  { value: 'na', label: '🌎 North America' },
  { value: 'sac', label: '🌎 Latam' },
  { value: 'vn', label: '🇻🇳 Vietnam' },
  { value: 'sg', label: '🇸🇬 Singapore' },
  { value: 'me', label: '🌍 Middle East' },
  { value: 'cis', label: '🌍 CIS' },
  { value: 'th', label: '🇹🇭 Thailand' },
  { value: 'id', label: '🇮🇩 Indonesia' },
  { value: 'tw', label: '🇹🇼 Taiwan' },
  { value: 'ru', label: '🇷🇺 Russia' },
];

function cleanCode(raw: string): string {
  return (raw || '')
    .trim()
    .toUpperCase()
    .replace(/[\u200B-\u200D\uFEFF\s]/g, '')
    .replace(/[^0-9A-Z#]/g, '');
}

function isValidMapCode(code: string): boolean {
  return /^[0-9a-zA-Z#]+$/.test(code);
}

function isValidApiCode(code: string): boolean {
  return /^[0-9A-Z]+$/.test(code);
}

function formatRichText(text: string): string {
  if (!text) return '';
  const cleanText = text.replace(/\[c\]/g, '');
  const tagStack: string[] = [];
  let output = '';
  let i = 0;
  while (i < cleanText.length) {
    if (cleanText[i] === '[') {
      if (i + 1 < cleanText.length && cleanText[i + 1] === '/') {
        const closeTagEnd = cleanText.indexOf(']', i);
        if (closeTagEnd !== -1) {
          const closeTagName = cleanText.substring(i + 2, closeTagEnd).toLowerCase();
          if (['b', 'i', 'u', 's'].includes(closeTagName) && tagStack.includes(closeTagName)) {
            output += `</${closeTagName}>`;
            tagStack.splice(tagStack.lastIndexOf(closeTagName), 1);
          }
          i = closeTagEnd + 1;
        } else {
          i++;
        }
      } else {
        const tagEnd = cleanText.indexOf(']', i);
        if (tagEnd !== -1) {
          const tagName = cleanText.substring(i + 1, tagEnd);
          const lowerTag = tagName.toLowerCase();
          if (['b', 'i', 'u', 's'].includes(lowerTag)) {
            output += `<${lowerTag}>`;
            tagStack.push(lowerTag);
          } else if (tagName.length === 6 && /^[0-9a-fA-F]+$/.test(tagName)) {
            output += `<span style="color:#${tagName}">`;
            tagStack.push(`color-${tagName}`);
          } else if (tagName === '-') {
            let lastColorIndex = -1;
            for (let j = tagStack.length - 1; j >= 0; j--) {
              if (tagStack[j].startsWith('color-')) {
                lastColorIndex = j;
                break;
              }
            }
            if (lastColorIndex !== -1) {
              output += '</span>';
              tagStack.splice(lastColorIndex, 1);
            }
          }
          i = tagEnd + 1;
        } else {
          i++;
        }
      }
    } else {
      output += cleanText[i];
      i++;
    }
  }
  while (tagStack.length > 0) {
    const tag = tagStack.pop();
    if (tag && tag.startsWith('color-')) output += '</span>';
    else output += `</${tag}>`;
  }
  return output.replace(/\n/g, '<br>');
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'N/A';
  try {
    const num = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const date = new Date(num * 1000);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return 'N/A';
  }
}

function formatNumber(num: any): string {
  if (num === undefined || num === null || isNaN(Number(num))) return 'N/A';
  const n = parseInt(num, 10);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Toggleable number component (matches .num-toggle functionality)
function NumberSpan({ value }: { value: any }) {
  const [expanded, setExpanded] = useState(false);
  if (value === undefined || value === null || isNaN(Number(value))) return <span>N/A</span>;
  const n = parseInt(value, 10);
  const compact = formatNumber(n);
  const full = n.toLocaleString('en-US');

  return (
    <span
      className="num-toggle"
      onClick={() => setExpanded(!expanded)}
      title="Click to toggle full / compact number"
    >
      {expanded ? full : compact}
    </span>
  );
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('gw_shizuka_unlocked') === 'true';
  });
  // Strictly tracks if the user actually clicked the Subscribe button
  const [hasClickedSubscribe, setHasClickedSubscribe] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);

  const [mapCode, setMapCode] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [resolvedRegion, setResolvedRegion] = useState<string>('');

  const mapTitleRef = useRef<HTMLSpanElement>(null);
  const titleRowRef = useRef<HTMLDivElement>(null);
  const responseBoxRef = useRef<HTMLDivElement>(null);
  const verifyTimerRef = useRef<any>(null);

  // Initialize query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const regionParam = params.get('region');
    if (regionParam) {
      setRegion(regionParam.toLowerCase());
    }
    if (codeParam) {
      const cleaned = cleanCode(codeParam);
      setMapCode(cleaned);
      if (isUnlocked) {
        executeSearch(cleaned, regionParam?.toLowerCase() || '');
      }
    }
  }, [isUnlocked]);

  // Window focus listener: ONLY unlocks if the user has clicked the subscribe button!
  useEffect(() => {
    const handleWindowFocus = () => {
      if (hasClickedSubscribe && verifying && !verifiedSuccess) {
        // User returned to window after clicking subscribe
        completeUnlock();
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    };
  }, [hasClickedSubscribe, verifying, verifiedSuccess]);

  const completeUnlock = () => {
    setVerifiedSuccess(true);
    setTimeout(() => {
      localStorage.setItem('gw_shizuka_unlocked', 'true');
      setIsUnlocked(true);
      setVerifying(false);
      showNotification('🎉 Welcome! Tool Unlocked Successfully');
    }, 1200);
  };

  // Triggered ONLY when the user physically clicks the Subscribe button
  const handleSubscribeClick = () => {
    setHasClickedSubscribe(true);
    setVerifying(true);

    // After 4.5 seconds or immediately when returning to tab, verify and unlock
    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
    verifyTimerRef.current = setTimeout(() => {
      completeUnlock();
    }, 4500);
  };

  // Fit title row dynamically
  const fitTitleRow = () => {
    if (!titleRowRef.current || !mapTitleRef.current) return;
    let fontSize = 32;
    mapTitleRef.current.style.fontSize = `${fontSize}px`;
    while (titleRowRef.current.scrollWidth > titleRowRef.current.clientWidth && fontSize > 14) {
      fontSize -= 2;
      mapTitleRef.current.style.fontSize = `${fontSize}px`;
    }
  };

  useEffect(() => {
    if (mapData) {
      fitTitleRow();
    }
  }, [mapData]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Map code copied to clipboard!');
    } catch {
      showNotification('Failed to copy code to clipboard');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = cleanCode(text);
      if (cleaned && isValidMapCode(cleaned)) {
        setMapCode(cleaned);
        showNotification('Code pasted from clipboard');
      } else {
        showNotification('Clipboard did not contain a valid map code');
      }
    } catch {
      showNotification('Paste blocked - paste manually into the input');
    }
  };

  const executeSearch = async (targetCode: string, targetRegion: string) => {
    const code = cleanCode(targetCode);
    const selRegion = (targetRegion || '').trim();

    if (!isValidMapCode(code)) {
      setErrorMessage('Please input a Map Code and Select Region for Better Results.');
      setMapData(null);
      setCreatorData(null);
      return;
    }

    const apiCode = code.replace(/#/g, '');
    if (!isValidApiCode(apiCode)) {
      setErrorMessage('Invalid Map Code.');
      setMapData(null);
      setCreatorData(null);
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    setCreatorLoading(true);
    setMapData(null);
    setCreatorData(null);

    // Sync URL parameters
    const cleanForURL = code.replace(/[^0-9a-zA-Z]/g, '');
    const newUrl = `${window.location.pathname}?region=${selRegion}&code=${cleanForURL}`;
    window.history.replaceState({}, '', newUrl);

    try {
      let resultData: any = null;
      let effectiveRegion = selRegion;

      // 1. Query server endpoint (/api/map)
      try {
        const res = await fetch(`/api/map?code=${encodeURIComponent(apiCode)}&region=${encodeURIComponent(selRegion)}`);
        if (res.ok) {
          const fetched = await res.json();
          if (fetched && fetched.status === 'success' && fetched['Map Details']) {
            resultData = fetched;
            effectiveRegion = (fetched.Region || selRegion || 'ind').toLowerCase();
          }
        }
      } catch {
        // In case of network issue or static deployment
      }

      // 2. Direct upstream fallback to ffcl.vercel.app
      if (!resultData) {
        const upstreamUrls = [
          `https://ffcl.vercel.app/go/map?code=${encodeURIComponent(apiCode)}&region=${encodeURIComponent(selRegion || 'ind')}`,
          `https://ffcl.vercel.app/api/map?code=${encodeURIComponent(apiCode)}&region=${encodeURIComponent(selRegion || 'ind')}`
        ];

        for (const url of upstreamUrls) {
          try {
            const upRes = await fetch(url, {
              headers: { 'Accept': 'application/json, text/plain, */*' }
            });
            if (upRes.ok) {
              const upData = await upRes.json();
              if (upData && upData.status === 'success' && upData['Map Details']) {
                resultData = upData;
                effectiveRegion = (upData.Region || selRegion || 'ind').toLowerCase();
                break;
              }
            }
          } catch {}
        }
      }

      if (resultData && resultData['Map Details']) {
        setMapData(resultData);
        setResolvedRegion(effectiveRegion);
        setLoading(false);

        // Fetch Creator Profile
        const creatorUID = resultData['Map Details']['Creator UID'];
        if (creatorUID && creatorUID !== 'N/A') {
          try {
            let cData: any = null;
            try {
              const creatorRes = await fetch(`/api/get?uid=${encodeURIComponent(creatorUID)}&region=${effectiveRegion || 'ind'}`);
              if (creatorRes.ok) {
                const parsed = await creatorRes.json();
                if (parsed && parsed['Craftland Profile']) {
                  cData = parsed;
                }
              }
            } catch {}

            if (!cData || !cData['Craftland Profile']) {
              try {
                const upCreatorRes = await fetch(`https://ffcl.vercel.app/go/get?uid=${encodeURIComponent(creatorUID)}&region=${effectiveRegion || 'ind'}`);
                if (upCreatorRes.ok) {
                  const upParsed = await upCreatorRes.json();
                  if (upParsed && upParsed['Craftland Profile']) {
                    cData = upParsed;
                  }
                }
              } catch {}
            }

            setCreatorData(cData);
          } catch {
            setCreatorData(null);
          } finally {
            setCreatorLoading(false);
          }
        } else {
          setCreatorLoading(false);
          setCreatorData(null);
        }

        // Scroll smoothly to response box
        setTimeout(() => {
          responseBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setLoading(false);
        setCreatorLoading(false);
        setErrorMessage('Map Not Found. Invalid Map Code or Region.');
      }
    } catch {
      setLoading(false);
      setCreatorLoading(false);
      setErrorMessage('Map Not Found. Invalid Map Code or Region.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(mapCode, region);
  };

  const mapDetails = mapData?.['Map Details'];
  const creatorUID = mapDetails?.['Creator UID'] || 'N/A';
  const mapCreator = mapDetails?.['Map Creator'] || 'Unknown Creator';
  const mapCodeToShow = mapDetails?.['Map Code'] || mapData?.Code || 'N/A';
  const popularity = parseInt(mapDetails?.['Popularity'] || '0', 10);
  const likes = mapDetails?.['Likes'] ? parseInt(mapDetails['Likes'], 10) : null;
  const likesRate = mapDetails?.['Likes Rate'] || null;
  const subscribers = mapDetails?.['Subscribers'] ? parseInt(mapDetails['Subscribers'], 10) : null;

  let likesDisplay = likes ? formatNumber(likes) : '';
  if (likesRate && likes) {
    const dislikes = mapDetails?.['Dislikes'] ? parseInt(mapDetails['Dislikes'], 10) : 0;
    likesDisplay = `${likesRate} (OF ${formatNumber(likes + dislikes)})`;
  }

  // Creator profile details
  const profile = creatorData?.['Craftland Profile'];
  const creatorLevel = profile?.['Creator Level'];
  const creatorBadge = profile?.['Creator Badge'];
  const isHighLevelCreator = parseInt(creatorLevel || '0', 10) >= 6;
  const totalMaps = profile ? (profile['Total Create Maps'] !== undefined ? profile['Total Create Maps'] : profile['Maps Create']) : null;
  const levelAchievedDate = Array.isArray(profile?.['Creator Level Achievement'])
    ? (profile['Creator Level Achievement'].find((a: any) => parseInt(a['Level'], 10) === parseInt(creatorLevel, 10)) || {})['Archive Time']
    : null;

  const tagBackgrounds = ['/icons/tag_gray.png', '/icons/tag_orange.png', '/icons/tag_green.png'];

  return (
    <>
      {/* Strict Sub2Unlock Lock Screen Modal: User CANNOT unlock without clicking the button */}
      {!isUnlocked && (
        <div className="lock-overlay">
          <div className="lock-card">
            <div className="lock-icon-circle">🔒</div>
            <div className="lock-title">Website Locked</div>
            <div className="lock-desc">
              Please subscribe to <span className="channel-highlight">{YT_CHANNEL_NAME}</span> on YouTube to unlock <strong>Craftland Map Finder by Shizuka</strong>!
            </div>

            {/* Direct YouTube Subscribe Link - Click is strictly required */}
            <a
              href={YT_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="lock-action-btn"
              onClick={handleSubscribeClick}
            >
              <span>🔴</span> Click Here to Subscribe & Unlock
            </a>

            {verifying && !verifiedSuccess && (
              <div className="verification-status">
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                <span>Subscribing... Return to this tab to finish unlocking!</span>
              </div>
            )}

            {verifiedSuccess && (
              <div className="verification-status success">
                <span>✅ Subscription confirmed! Unlocking website...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Title */}
      <h2>Craftland Map Finder by Shizuka</h2>

      {/* Main Search Form */}
      <form id="mapForm" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            id="mapcode"
            placeholder="Enter Map Code"
            value={mapCode}
            onChange={(e) => setMapCode(cleanCode(e.target.value))}
            required
            autoComplete="off"
            spellCheck={false}
          />
          <div className="input-actions">
            <button
              type="button"
              id="pasteBtn"
              className="paste-btn"
              title="Paste from clipboard"
              onClick={handlePaste}
            >
              <img src="/icons/paste.svg" alt="Paste" />
            </button>
            <button
              type="submit"
              id="submitBtn"
              className="search-btn"
              title="Search Map"
              disabled={loading}
            >
              <img src="/icons/search.svg" alt="Search" />
            </button>
          </div>
        </div>

        <select
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </form>

      {/* Response Box */}
      <div
        id="responseBox"
        ref={responseBoxRef}
        className={loading || errorMessage || mapData ? 'active' : ''}
      >
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">Searching...</div>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="error">❌ {errorMessage}</div>
        )}

        {!loading && mapData && mapDetails && (
          <div>
            {/* Map Title Row */}
            <div className="map-title-row" ref={titleRowRef}>
              <span
                className="map-title"
                ref={mapTitleRef}
                dangerouslySetInnerHTML={{
                  __html: formatRichText(mapDetails['Map Title'] || 'N/A')
                }}
              />
              {popularity > 0 && (
                <span className="map-title-popularity">
                  <NumberSpan value={popularity} />
                  <img src="/icons/fire.svg" alt="Popularity" />
                </span>
              )}
            </div>

            {/* Map Cover Container */}
            <div className="map-cover-container">
              {mapDetails['Map Cover'] ? (
                <img
                  src={mapDetails['Map Cover']}
                  alt="Map Cover"
                  className="map-cover"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              <div className="map-cover-footer">
                {likes ? (
                  <>
                    <img src="/icons/like.svg" alt="Likes" />
                    <span>{likesDisplay}</span>
                  </>
                ) : null}
                {subscribers ? (
                  <>
                    <img src="/icons/star.svg" alt="Subscribers" />
                    <NumberSpan value={subscribers} />
                  </>
                ) : null}
                <span className="map-code-text">Map Code</span>
                <button
                  type="button"
                  className="copy-icon copy-icon-footer"
                  onClick={() => copyToClipboard(mapCodeToShow)}
                  title="Copy to clipboard"
                >
                  <img src="/icons/copy.svg" alt="Copy Code" />
                </button>
              </div>

              {/* Tags */}
              {Array.isArray(mapDetails['Tags']) && mapDetails['Tags'].length > 0 && (
                <div className="map-tags-container">
                  {mapDetails['Tags'].slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={tag + index}
                      className="map-tag"
                      style={{ backgroundImage: `url(${tagBackgrounds[index % tagBackgrounds.length]})` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="creator-info">
              <div>
                <span className="creator-label">Created by: </span>
                {creatorBadge && (
                  <img
                    src={creatorBadge}
                    className="creator-badge"
                    alt={`Level ${creatorLevel}`}
                    title={`Creator Level ${creatorLevel}`}
                  />
                )}
                <span className={isHighLevelCreator ? 'creator-name-gradient' : 'creator-name-bright'}>
                  {mapCreator}
                </span>
              </div>
              <div>
                <span className="creator-label">UID: </span>
                <span className="uid-value">{creatorUID}</span>
              </div>
            </div>

            {/* Detailed Properties */}
            <div className="map-details">
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <div
                  className="detail-value formatted-text"
                  dangerouslySetInnerHTML={{
                    __html: formatRichText(mapDetails['Map Description'] || 'An exciting map in Free Fire Craftland.')
                  }}
                />
              </div>

              {likes && (
                <div className="single-line-row">
                  <span className="detail-label">Likes:</span>
                  <span className="detail-value">
                    <NumberSpan value={likes} /> {likesRate ? `(${likesRate})` : ''}
                  </span>
                </div>
              )}

              {mapDetails['Dislikes'] && (
                <div className="single-line-row">
                  <span className="detail-label">Dislikes:</span>
                  <span className="detail-value">
                    <NumberSpan value={mapDetails['Dislikes']} />
                  </span>
                </div>
              )}

              {subscribers && (
                <div className="single-line-row">
                  <span className="detail-label">Subscribers:</span>
                  <span className="detail-value">
                    <NumberSpan value={subscribers} />
                  </span>
                </div>
              )}

              {mapDetails['Map'] && (
                <div className="single-line-row">
                  <span className="detail-label">Map:</span>
                  <span className="detail-value">{mapDetails['Map']}</span>
                </div>
              )}

              {mapDetails['Create Time'] && (
                <div className="single-line-row">
                  <span className="detail-label">Create Time:</span>
                  <span className="detail-value">{formatTimestamp(mapDetails['Create Time'])}</span>
                </div>
              )}

              {mapDetails['Update Time'] && (
                <div className="single-line-row">
                  <span className="detail-label">Update Time:</span>
                  <span className="detail-value">{formatTimestamp(mapDetails['Update Time'])}</span>
                </div>
              )}

              {mapDetails['MinPlayTime'] && (
                <div className="single-line-row">
                  <span className="detail-label">Min Play Time:</span>
                  <span className="detail-value">{mapDetails['MinPlayTime']} minutes</span>
                </div>
              )}

              {mapDetails['MaxPlayTime'] && mapDetails['MaxPlayTime'] !== mapDetails['MinPlayTime'] && (
                <div className="single-line-row">
                  <span className="detail-label">Max Play Time:</span>
                  <span className="detail-value">{mapDetails['MaxPlayTime']} minutes</span>
                </div>
              )}

              {popularity > 0 && (
                <div className="single-line-row">
                  <span className="detail-label">Popularity:</span>
                  <span className="detail-value">
                    <NumberSpan value={popularity} />
                  </span>
                </div>
              )}

              {mapDetails['Teams'] && (
                <div className="single-line-row">
                  <span className="detail-label">Teams:</span>
                  <span className="detail-value">{mapDetails['Teams']}</span>
                </div>
              )}

              {mapDetails['Game Mode'] && (
                <div className="single-line-row">
                  <span className="detail-label">Game Mode:</span>
                  <span className="detail-value">{mapDetails['Game Mode']}</span>
                </div>
              )}
            </div>

            {/* Creator Profile Section */}
            {creatorLoading && (
              <div className="creator-loading-container">
                <div className="creator-spinner"></div>
                <div className="creator-loading-text">Loading creator profile...</div>
              </div>
            )}

            {!creatorLoading && creatorData?.error && (
              <div className="error" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                ❌ {creatorData.error}
              </div>
            )}

            {!creatorLoading && profile && (
              <>
                <div className="creator-profile-title">Creator Profile</div>
                <div className="map-details">
                  <div className="single-line-row">
                    <span className="detail-label">Creator Name:</span>
                    <span className="detail-value">
                      {creatorBadge && (
                        <img
                          src={creatorBadge}
                          className="creator-badge"
                          alt={`Level ${creatorLevel}`}
                        />
                      )}
                      <span className={isHighLevelCreator ? 'creator-name-gradient' : 'creator-name-bright'}>
                        {mapCreator}
                      </span>
                    </span>
                  </div>

                  {profile['Craftland EXP'] !== undefined && (
                    <div className="single-line-row">
                      <span className="detail-label">Craftland EXP:</span>
                      <span className="detail-value">
                        <NumberSpan value={profile['Craftland EXP']} />
                      </span>
                    </div>
                  )}

                  <div className="single-line-row">
                    <span className="detail-label">Maps Created:</span>
                    <span className="detail-value">{totalMaps !== null ? totalMaps : '0'}</span>
                  </div>

                  {profile['Public Maps'] !== undefined && (
                    <div className="single-line-row">
                      <span className="detail-label">Public Maps:</span>
                      <span className="detail-value">{profile['Public Maps']}</span>
                    </div>
                  )}

                  {profile['Likes'] !== undefined && (
                    <div className="single-line-row">
                      <span className="detail-label">Likes:</span>
                      <span className="detail-value">
                        <NumberSpan value={profile['Likes']} />
                      </span>
                    </div>
                  )}

                  {profile['Subscribers'] !== undefined && (
                    <div className="single-line-row">
                      <span className="detail-label">Subscribers:</span>
                      <span className="detail-value">
                        <NumberSpan value={profile['Subscribers']} />
                      </span>
                    </div>
                  )}

                  {profile['Followers'] !== undefined && (
                    <div className="single-line-row">
                      <span className="detail-label">Followers:</span>
                      <span className="detail-value">
                        <NumberSpan value={profile['Followers']} />
                      </span>
                    </div>
                  )}

                  {profile['CraftPoint'] !== undefined && (
                    <div className="single-line-row">
                      <span className="detail-label">CraftPoint:</span>
                      <span className="detail-value">
                        <NumberSpan value={profile['CraftPoint']} />
                      </span>
                    </div>
                  )}

                  <div className="single-line-row">
                    <span className="detail-label">Creator Level:</span>
                    <span className="detail-value">
                      {creatorLevel !== undefined ? creatorLevel : 'N/A'}
                      {levelAchievedDate && (
                        <span className="level-since"> (since {levelAchievedDate})</span>
                      )}
                    </span>
                  </div>

                  {profile['About'] && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">About:</span>
                      </div>
                      <div
                        className="about-text"
                        dangerouslySetInnerHTML={{
                          __html: formatRichText(profile['About'])
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Other Maps by Creator */}
                {Array.isArray(creatorData['Map Details']) && creatorData['Map Details'].length > 0 && (
                  <>
                    <div className="other-maps-title">OTHER MAPS BY {mapCreator}</div>
                    <div className="other-maps-container">
                      {creatorData['Map Details']
                        .map((m: any) => (m && m['Name'] !== undefined ? m : m[Object.keys(m)[0]]))
                        .sort((a: any, b: any) => (parseInt(b['Popularity'], 10) || 0) - (parseInt(a['Popularity'], 10) || 0))
                        .map((otherMap: any, idx: number) => {
                          const otherPopularity = parseInt(otherMap['Popularity'], 10) || 0;
                          return (
                            <div key={(otherMap['Code'] || '') + idx} className="other-map-item">
                              <div className="other-map-name">
                                <span className="other-map-name-text">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: formatRichText(otherMap['Name'] || 'N/A')
                                    }}
                                  />
                                  {otherPopularity > 0 && (
                                    <span className="other-map-popularity">
                                      <NumberSpan value={otherPopularity} />
                                      <img src="/icons/fire.svg" alt="Popularity" />
                                    </span>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  className="copy-icon"
                                  onClick={() => copyToClipboard(otherMap['Code'] || '')}
                                  title="Copy to clipboard"
                                >
                                  <img src="/icons/copy.svg" alt="Copy" />
                                </button>
                              </div>

                              {(otherMap['Like'] !== undefined ||
                                otherMap['Subscriber'] !== undefined ||
                                otherMap['PlaySeason'] !== undefined) && (
                                <div className="other-map-stats">
                                  {otherMap['Like'] !== undefined && (
                                    <span className="other-map-stat">
                                      <img src="/icons/like.svg" alt="Likes" />
                                      <NumberSpan value={otherMap['Like']} />
                                    </span>
                                  )}
                                  {otherMap['Subscriber'] !== undefined && (
                                    <span className="other-map-stat">
                                      <img src="/icons/star.svg" alt="Subscribers" />
                                      <NumberSpan value={otherMap['Subscriber']} />
                                    </span>
                                  )}
                                  {otherMap['PlaySeason'] !== undefined && (
                                    <span className="other-map-stat">
                                      <span className="play-icon" title="Plays"></span>
                                      <NumberSpan value={otherMap['PlaySeason']} />
                                    </span>
                                  )}
                                </div>
                              )}

                              <div
                                className="other-map-code"
                                onClick={() => {
                                  const targetCode = otherMap['Code'] || otherMap['OriginalCode'] || '';
                                  setMapCode(targetCode);
                                  executeSearch(targetCode, resolvedRegion);
                                }}
                                style={{ cursor: 'pointer' }}
                                title="Click to view this map"
                              >
                                {otherMap['Code'] || 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Copy Notification Toast */}
      {notification && (
        <div id="notification" className="notification show">
          {notification}
        </div>
      )}
    </>
  );
}
