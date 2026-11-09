const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!configuredApiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured. Set it in your local .env file and Vercel environment variables.",
  );
}

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");