import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { randomString } from './utils'
import { Track } from '@/shared/api'
import JSZip from 'jszip'
import axios from 'axios'
import { saveAs } from 'file-saver'
import { slice } from 'lodash-es'

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
    _downloadAll: [] as string[],
  }),
  actions: {
    setError(error: Error) {
      this.addNotification({ message: `${error.message} ${error.stack}`, title: error.name, notAutoHide: true, type: 'danger' })
    },
    addNotification(n: Notification) {
      if (!n.id) n.id = randomString()
      const notifications = this.notifications
      const ind = notifications.findIndex(v => v.id === n.id)
      if (ind >= 0) {
        notifications[ind] = n
        this.notifications = [...notifications]
      } else {
        this.notifications = [...notifications, n]
      }
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
    downloadAll(name: string, tracks: Track[]) {
      if (this._downloadAll.includes(name)) {
        this.addNotification({ message: `${name} - already in progress, please wait`, title: 'Download all', notAutoHide: true })
        return
      }
      this._downloadAll.push(name)

      const abortController = new AbortController()
      const notifyPreset = { title: 'Download all', id: `download-all-${name}`, notAutoHide: true, action: { title: 'Cancel', click: () => abortController.abort() } }
      let downloadedFiles = 0
      const downloadProgress = {} as {[key: string]: number }
      let downloadProgressLast = new Date().valueOf()

      const onDownloadProgress = (progressEvent: any) => {
        downloadProgress[progressEvent?.event?.target?.responseURL] = Math.floor(progressEvent.loaded / progressEvent.total * 100)
        if (new Date().valueOf() - downloadProgressLast > 2000) {
          this.addNotification({ message: `${name}  [${downloadedFiles}/${tracks.length}] - progress ${Math.round(Object.values(downloadProgress).reduce((a, b) => a + b, 0) / tracks.length)}%`, ...notifyPreset })
          downloadProgressLast = new Date().valueOf()
        }
      }

      this.addNotification({ message: `${name}  [${downloadedFiles}/${tracks.length}] - starting download`, ...notifyPreset })

      const zip = new JSZip()

      const collection = tracks.map(track => {
        return axios.get(this.api.getDownloadUrl(track.id), { responseType: 'blob', onDownloadProgress, signal: abortController.signal }).then((resp) => {
          zip.file(track.fileName || track.id, resp.data)
          downloadedFiles++
          this.addNotification({ message: `${name} [${downloadedFiles}/${tracks.length}] - done "${track.fileName}"`, ...notifyPreset, action: undefined, notAutoHide: false, id: `download-all-${name}-track` })
        })
      })
      Promise.all(collection)
        .then(() => {
          this.addNotification({ message: `${name} [${downloadedFiles}/${tracks.length}] - downloaded`, ...notifyPreset, action: undefined })

          zip.generateAsync({ type: 'blob' }).then((blob) => {
            this.addNotification({ message: `${name} [${downloadedFiles}/${tracks.length}] - save`, ...notifyPreset, action: undefined })
            saveAs(blob, `${name}.zip`)
          })
        })
        .catch((err) => {
          this.addNotification({ message: `${name} [${downloadedFiles}/${tracks.length}] - download error, ${err?.message}`, ...notifyPreset, type: 'danger', action: undefined })
        }).finally(() => {
          this._downloadAll = this._downloadAll.filter(d => d !== name)
        })
    },
  },
})
