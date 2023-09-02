<template>
  <b-modal :visible="visible" scrollable hide-backdrop :hide-footer="type !== 'new'" @change="cancel">
    <template #modal-header-close>
      <Icon icon="x" />
    </template>
    <template v-if="tracks?.length" #modal-title>
      Add to Playlist {{ tracks?.length ? `${tracks?.length} ${tracks?.length > 1 ? 'tracks' : 'track' }` : '' }}
    </template>
    <template v-else #modal-title>
      Create Playlist
    </template>

    <div v-if="type === 'new'">
      <div class="form-group">
        <label>Name</label>
        <input v-model="item.name" class="form-control" type="text">
      </div>
    </div>

    <div class="list-group list-group-flush" v-else-if="type === 'select'">
      <b-button type="button" class="list-group-item list-group-item-action text-truncate text-center" @click="type = 'new'">
        Create new playlist
      </b-button>
      <b-button v-for="p in playlists" :key="p.id" type="button" class="list-group-item list-group-item-action text-truncate" @click="save(p.id)" variant="outline-secondary">
        {{ p.name }}
      </b-button>
    </div>

    <template #modal-footer>
      <b-button type="button" variant="primary" @click="save()">
        Create
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { storeToRefs } from 'pinia'
  import { usePlaylistStore } from '@/library/playlist/store'
  import { useMainStore } from '@/shared/store'
  import { Playlist, Track } from '@/shared/api'
  import { BFormDatepicker } from 'bootstrap-vue'

  export default defineComponent({
    components: {
      BFormDatepicker
    },
    props: {
      visible: { type: Boolean, required: true },
      tracks: { type: Array<Track> },
      new: { type: Boolean }
    },
    data() {
      return {
        type: this.new ? 'new' : 'select',
        item: {} as Playlist,
      }
    },
    setup() {
      const playlistStore = usePlaylistStore()
      const { playlists } = storeToRefs(playlistStore)
      return {
        mainStore: useMainStore(),
        playlistStore,
        playlists,
      }
    },
    async created() {
      await this.playlistStore.load()
    },
    methods: {
      cancel() {
        this.$emit('update:visible', false)
        this.item = {} as Playlist
        this.type = this.new ? 'new' : 'select'
      },
      async save(playlistId = '') {
        if (playlistId) {
          if (!this.tracks) {
            this.mainStore.addNotification({ message: 'Nothing to add', title: 'Playlist' })
            return
          }
          await this.playlistStore.addTracks(playlistId, this.tracks.map(t => t.id))
          this.mainStore.addNotification({ message: `Successfully added ${this.tracks.length} ${this.tracks?.length > 1 ? 'tracks' : 'track'} to playlist`, title: 'Playlist' })
          this.cancel()
        } else {
          if (this.item.name.length === 0) {
            this.mainStore.addNotification({ message: 'Name can not be empty', title: 'Playlist' })
            return
          }
          await this.playlistStore.create({ name: this.item.name, ...(this.tracks ? { songId: this.tracks.map(t => t.id) } : {}) })
          const addedMessage = this.tracks ? ` and added ${this.tracks.length} ${this.tracks?.length > 1 ? 'tracks' : 'track'} to playlist` : ''
          this.mainStore.addNotification({ message: `Successfully created ${addedMessage}`, title: 'Playlist' })
          this.cancel()
        }
      },
    }
  })
</script>
