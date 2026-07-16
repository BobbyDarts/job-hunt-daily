// /src/lib/environment.ts

export const environment = {
  version: __APP_VERSION__,
  deployment: import.meta.env.VITE_ENVIRONMENT,
  isDev: import.meta.env.DEV,
};
