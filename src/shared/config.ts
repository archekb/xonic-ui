export interface Config {
  serverUrl: string
  settingsEnv: string
}

const env = (window as any).env

export const config: Config = {
  serverUrl: env?.XONIC_SERVER_URL || '',
  settingsEnv: env?.XONIC_SETTINGS || '',
}
