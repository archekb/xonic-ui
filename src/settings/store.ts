import { defineStore } from 'pinia'
import jp from 'jsonpath'
import { cloneDeep, merge } from 'lodash-es'
import { config } from '@/shared/config'

export interface Theme {
  primary?: string
  secondary?: string
  text_body?: string
  text_muted?: string
  background0?: string
  background1?: string
  background2?: string
  icons?: string
  hover?: string
  btn_text?: string
}

export const enums = {
  menu: ['discover', 'playing', 'albums', 'artists', 'genres', 'playlists', 'favourites', 'shares', 'podcasts', 'radio', 'files'],
  themes: {
    Default: {},
    'Dark Blue': { primary: '#09f', secondary: '#2e2e2e', icons: '#999' },
    'Dark Red': { primary: '#b72324', secondary: '#500606', icons: '#c93939' },
    'Dark Green': { primary: '#2cb723', secondary: '#115006', icons: '#4fc939' },
    'Dark Yellow': { primary: '#b7b223', secondary: '#4f5006', icons: '#c9c539' },

    'Light Blue': { primary: '#008be7', secondary: '#9caabd', text_body: '#3e3e3e', text_muted: '#727272', icons: '#3074c9', hover: '#0000000b', background0: '#e1e1e1', background1: '#d3d3d3', background2: '#bfbfbf', },
    'Light Red': { primary: '#b72323', secondary: '#500606', text_body: '#3e3e3e', text_muted: '#727272', icons: '#c93939', hover: '#0000000b', background0: '#e1e1e1', background1: '#d3d3d3', background2: '#bfbfbf', },
    'Light Green': { primary: '#2cb723', secondary: '#115006', text_body: '#3e3e3e', text_muted: '#727272', icons: '#4fc939', hover: '#0000000b', background0: '#e1e1e1', background1: '#d3d3d3', background2: '#bfbfbf', },

  } as {[key: string]: Theme},
  theme_default: { primary: '#8cb723', secondary: '#3e5006', text_body: '#ccc', text_muted: '#999', icons: '#acc939', hover: '#ffffff1a', background0: '#000000', background1: '#141414', background2: '#2e2e2e', btn_text: '#fff' } as Theme,
}

const DefaultSettings = {
  ui: {
    menu: {
      list: ['discover', 'playing', 'albums', 'artists', 'genres', 'playlists', 'favourites', 'shares', 'podcasts', 'radio', 'files'],
      playlists: true,
    },
    theme: {},
    root: 'discover',
    return_to: '',
  },
  player: {
    random_playlist_length: 200,
  }
}

function Defaults() {
  const settings = cloneDeep(DefaultSettings)

  try {
    const envSettings = JSON.parse(config.settingsEnv || 'null')
    if (envSettings) {
      merge(settings, envSettings)
    }
  } catch (e) {
    console.log("Can't parse settings from env", e)
  }

  return settings
}

export const useSettingsStore = defineStore('settings', {
  state: () => {
    const settings = Defaults()

    try {
      const localSettings = JSON.parse(window.localStorage.getItem('client_settings') || 'null')
      if (localSettings) {
        merge(settings, localSettings)
      }
    } catch (e) {
      window.localStorage.setItem('client_settings', JSON.stringify(settings))
    }

    return { settings }
  },
  actions: {
    get(path: string) {
      return jp.value(this.settings, `$.${path}`)
    },
    set(path: string, value: any) {
      const settings = cloneDeep(this.settings)
      jp.value(settings, `$.${path}`, value)
      this.settings = settings
      window.localStorage.setItem('client_settings', JSON.stringify(this.settings))
    },
    includes(path: string, value: any) {
      const pv = jp.value(this.settings, `$.${path}`)
      return Array.isArray(pv) ? pv.includes(value) : false
    },
    reset() {
      this.settings = Defaults()
      window.localStorage.setItem('client_settings', JSON.stringify(this.settings))
    }
  }
})
