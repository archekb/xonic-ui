import { defineStore } from 'pinia'
import { Share } from '@/shared/api'

export const useShareStore = defineStore('share', {
  state: () => ({
    supported: true,
    shares: null as null | Share[],
    _loading: false,
  }),
  actions: {
    async load(force = false) {
      if (this.supported === false || this._loading || (!force && this.shares !== null)) return
      try {
        this._loading = true
        this.shares = await this.api.getShares()
      } catch (e) {
        this.supported = false
      } finally {
        this._loading = false
      }
    },
    async create({ id, description, expires, secret, download }: any): Promise<Share> {
      const share = await this.api.addShare({ id, description, expires, secret, download })
      this.shares = [...(this.shares ? this.shares : []), share]
      return share
    },
    async update({ id, description, expires, protection, download, add, remove }: any) {
      await this.api.updateShare({ id, description, expires, protection, download, add, remove })
      const share = this.shares ? this.shares.find(s => s.id === id) : null
      if (share) {
        this.shares = [...(this.shares ? this.shares.filter(s => s.id !== id) : []), share]
      }
    },
    async addTracks(id: string, add: string[]) {
      await this.api.updateShare({ id, add })
    },
    // async removeTrack(playlistId: string, index: number) {

    // },
    async delete(id: string) {
      await this.api.deleteShare(id)
      this.shares = this.shares!.filter(p => p.id !== id)
    },
  },
})
