import { defineStore } from 'pinia'
import { RadioStation } from '@/shared/api'

export const useRadioStore = defineStore('radio', {
  state: () => ({
    supported: true,
    stations: null as null | RadioStation[],
  }),
  actions: {
    async load() {
      try {
        this.stations = await this.api.getRadioStations()
      } catch (e) {
        this.supported = false
      }
    },
    async create(name: string, url: string, homepageUrl: string) {
      return this.api.addRadioStation(name, url, homepageUrl).then(() => {
        this.load()
      })
    },
    async update(item: RadioStation) {
      await this.api.updateRadioStation(item)
      if (!this.stations) return
      this.stations = [...this.stations.map(rs => (rs.id !== item.id) ? rs : item)]
    },
    async delete(id: string) {
      await this.api.deleteRadioStation(id)
      if (!this.stations) return
      this.stations = [...this.stations.filter(rs => rs.id !== id)]
    },
  },
})
