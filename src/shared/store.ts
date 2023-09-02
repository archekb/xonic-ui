import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { randomString } from './utils'

export interface Notification {
  id?: string
  type?: string
  title?: string
  notAutoHide?: boolean
  message: string
  action?: {
    title: string,
    click: () => void,
  }
}

export const useMainStore = defineStore('main', {
  state: () => ({
    isLoggedIn: false,
    username: null as null | string,
    server: null as null | string,
    error: null as null | Error,
    notifications: [] as Notification[],
    menuVisible: false,
    artistAlbumSortOrder: useLocalStorage<'desc' | 'asc'>('settings.artistAlbumSortOrder', 'desc'),
  }),
  actions: {
    setError(error: Error) {
      this.addNotification({ message: `${error.message} ${error.stack}`, title: error.name, notAutoHide: true, type: 'danger' })
    },
    addNotification(n: Notification) {
      if (!n.id) n.id = randomString()
      this.notifications = [...this.notifications.filter(v => v.id !== n.id), n]
    },
    removeNotification(id: string) {
      this.notifications = this.notifications.filter(v => v.id !== id)
    },
    setLoginSuccess(username: string, server: string) {
      this.isLoggedIn = true
      this.username = username
      this.server = server
    },
    showMenu() {
      this.menuVisible = true
    },
    hideMenu() {
      this.menuVisible = false
    },
    toggleArtistAlbumSortOrder() {
      this.artistAlbumSortOrder = this.artistAlbumSortOrder === 'asc' ? 'desc' : 'asc'
    },
  },
})
