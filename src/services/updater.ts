export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  title: string;
  changelog: string[];
  apkUrl: string;
  releaseDate?: string;
  githubUrl?: string;
}

export const CURRENT_APP_VERSION = '1.0.0';

/**
 * Compare two semver strings (e.g. "1.0.1" vs "1.0.0")
 * Returns > 0 if v1 > v2, < 0 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/i, '').trim();
  const clean2 = v2.replace(/^v/i, '').trim();

  const parts1 = clean1.split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Checks upstream for new releases.
 * Priority 1: App server hosted /version.json (fastest, no rate limits, works in domestic networks)
 * Priority 2: GitHub Releases API
 */
export async function checkForAppUpdates(): Promise<UpdateInfo> {
  // Strategy 1: Check internal /version.json
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.version) {
        const hasUpdate = compareVersions(data.version, CURRENT_APP_VERSION) > 0;
        return {
          hasUpdate,
          currentVersion: CURRENT_APP_VERSION,
          latestVersion: data.version,
          title: data.title || `版本 ${data.version} 已就绪`,
          changelog: Array.isArray(data.changelog) ? data.changelog : ['性能优化与体验改进'],
          apkUrl: data.apkUrl || '/RenderCraft-v1.0.0.apk',
          releaseDate: data.releaseDate,
          githubUrl: data.githubReleaseUrl || 'https://github.com/zhuquan7237/-/releases',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch local version.json, falling back to GitHub API', err);
  }

  // Strategy 2: Check GitHub Releases API
  try {
    const ghRes = await fetch('https://api.github.com/repos/zhuquan7237/RenderCraft/releases/latest');
    if (ghRes.ok) {
      const ghData = await ghRes.json();
      const tagName = (ghData.tag_name || '1.0.0').replace(/^v/i, '');
      const hasUpdate = compareVersions(tagName, CURRENT_APP_VERSION) > 0;

      // Find apk asset if any
      const apkAsset = ghData.assets?.find(
        (a: { name: string; browser_download_url: string }) => a.name.endsWith('.apk')
      );

      return {
        hasUpdate,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: tagName,
        title: ghData.name || `RenderCraft v${tagName}`,
        changelog: ghData.body
          ? ghData.body.split('\n').filter((l: string) => l.trim().length > 0)
          : ['已同步 GitHub 上游最新更新'],
        apkUrl: apkAsset ? apkAsset.browser_download_url : '/RenderCraft-v1.0.0.apk',
        releaseDate: ghData.published_at || ghData.created_at,
        githubUrl: ghData.html_url,
      };
    }
  } catch (err) {
    console.warn('Failed to check GitHub releases', err);
  }

  return {
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    title: '已是最新版本',
    changelog: ['当前已是最新版本，无需更新'],
    apkUrl: '/RenderCraft-v1.0.0.apk',
  };
}
