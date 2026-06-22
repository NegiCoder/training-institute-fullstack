/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

type AppEnv = {
  apiBaseUrl: string
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('Missing environment variable: VITE_API_BASE_URL')
}

export const env: AppEnv = {
  apiBaseUrl,
}
