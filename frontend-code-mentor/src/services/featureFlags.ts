/**
 * Minimal flags.dev Client for CodeMentor
 *
 * Security Model:
 * Browser clients use environment-scoped evaluation keys (`VITE_FLAGS_DEV_API_KEY`)
 * because the key grants evaluation-only access (GET /api/v1/evaluate/...) with no
 * management privileges.
 */

export interface FeatureFlagConfig {
  apiUrl?: string;
  envId?: string;
  apiKey?: string;
}

function getFeatureFlagsConfig(): FeatureFlagConfig {
  const apiUrl = import.meta.env.VITE_FLAGS_DEV_API_URL?.trim();
  const envId = import.meta.env.VITE_FLAGS_DEV_ENV_ID?.trim();
  const apiKey = import.meta.env.VITE_FLAGS_DEV_API_KEY?.trim();

  return { apiUrl, envId, apiKey };
}

/**
 * Evaluates whether a feature flag is enabled for the given feature key.
 *
 * Calls: GET /api/v1/evaluate/environments/{environmentId}/features/{featureKey}
 * Header: X-API-Key
 *
 * Safe Fallback: Returns `false` on missing configuration, network error,
 * non-200 HTTP status, CORS error, or unexpected JSON response.
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  if (!featureKey) {
    return false;
  }

  const { apiUrl, envId, apiKey } = getFeatureFlagsConfig();

  // Validate configuration — NO default localhost fallback.
  if (!apiUrl || !envId || !apiKey) {
    if (import.meta.env.DEV) {
      console.warn(
        `[featureFlags] Missing configuration for flags.dev (VITE_FLAGS_DEV_API_URL, VITE_FLAGS_DEV_ENV_ID, or VITE_FLAGS_DEV_API_KEY). Safe fallback: returning false for feature "${featureKey}".`
      );
    }
    return false;
  }

  const normalizedApiUrl = apiUrl.replace(/\/+$/, '');
  const url = `${normalizedApiUrl}/api/v1/evaluate/environments/${encodeURIComponent(
    envId
  )}/features/${encodeURIComponent(featureKey)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.warn(
          `[featureFlags] HTTP ${response.status} evaluating feature "${featureKey}". Safe fallback: returning false.`
        );
      }
      return false;
    }

    const data = await response.json();

    // Support standard { enabled: boolean } and wrapped { data: { enabled: boolean } } responses
    if (typeof data?.enabled === 'boolean') {
      return data.enabled;
    }
    if (typeof data?.data?.enabled === 'boolean') {
      return data.data.enabled;
    }

    if (import.meta.env.DEV) {
      console.warn(
        `[featureFlags] Unexpected JSON structure evaluating feature "${featureKey}". Received:`,
        data
      );
    }
    return false;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        `[featureFlags] Network / CORS error evaluating feature "${featureKey}":`,
        error
      );
    }
    return false;
  }
}
