import { defineStore } from 'pinia'
import { RadioStation } from '@/shared/api'

export const useRadioStore = defineStore('radio', {
  state: () => ({
    supported: null as null | boolean,
    stations: null as null | RadioStation[],
  }),
  actions: {
    async load() {
      try {
        this.stations = await this.api.getRadioStations()
        this.supported = true
      } catch (e) {
        this.supported = false
      }
    },
    async create(name: string, url: string, homepageUrl: string) {
      return this.api.addRadioStation(name, url, homepageUrl).then(result => {
        this.load()
      })
    },
    async update(item: RadioStation) {
      return this.api.updateRadioStation(item).then(result => {
        this.stations = this.stations!.map(rs => (rs.id !== item.id) ? rs : item)
      })
    },
    async delete(id: string) {
      return this.api.deleteRadioStation(id).then(result => {
        this.stations = this.stations!.filter(rs => rs.id !== id)
      })
    },
  },
})
