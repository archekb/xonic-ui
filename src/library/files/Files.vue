<template>
  <ContentLoader v-slot v-if="supported" :loading="files === null">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h1 class="mb-0 mr-2 text-truncate">
        Files
      </h1>
      <div v-if="files.files">
        <b-button variant="secondary" class="mr-2" @click="playNow">
          <Icon icon="play" /> Play
        </b-button>
        <b-button variant="secondary" class="mr-2" @click="shuffleNow">
          <Icon icon="shuffle" /> Shuffle
        </b-button>
      </div>
    </div>
    <div class="bc align-items-center mb-2">
      <span v-for="p, i in path" :key="i" class="bc-item">
        <b-button variant="link" class="px-1 py-0" @click="pathSlice(i)" :disabled="i === path.length-1">
          <template v-if="!!p">{{ p }}</template>
          <template v-else><Icon icon="home" /></template>
        </b-button>
      </span>
    </div>

    <BaseTable>
      <BaseTableHead />
      <tbody class="text-break">
        <template v-if="files.id">
          <tr @click="pathPop()">
            <td>
              <Icon icon="folder" />
            </td>
            <td colspan="2">
              ..
            </td>
          </tr>
        </template>
        <template v-if="files.dirs">
          <tr v-for="item in files.dirs" :key="item.id" @click="pathPush(item.id)">
            <td>
              <Icon icon="folder" />
            </td>
            <td colspan="2">
              {{ item.name }}
            </td>
          </tr>
        </template>
        <template v-if="files.files">
          <tr v-for="item in files.files" :key="item.id" :class="{'active': item.id === playingTrackId}" @click="playTrack(item)">
            <CellTrackNumber :active="item.id === playingTrackId && isPlaying" :value="item.track" />
            <CellTitle :track="item" />
            <CellActions :track="item" />
          </tr>
        </template>
      </tbody>
    </BaseTable>
  </ContentLoader>
  <EmptyIndicator v-else label="Files are not supported" />

</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useFilesStore } from '@/library/files/store'
  import { Track } from '@/shared/api'
  import BaseTable from '@/shared/components/BaseTable.vue'
  import BaseTableHead from '@/shared/components/BaseTableHead.vue'
  import CellTrackNumber from '@/shared/components/track/CellTrackNumber.vue'
  import CellTitle from '@/shared/components/track/CellTitle.vue'
  import CellActions from '@/shared/components/track/CellActions.vue'

  export default defineComponent({
    components: {
      BaseTable,
      BaseTableHead,
      CellTrackNumber,
      CellTitle,
      CellActions
    },
    props: {
      pathID: { type: String, default: '' }
    },
    setup() {
      const filesStore = useFilesStore()
      const { supported, files, pathString } = storeToRefs(filesStore)
      return { supported, filesStore, files, pathString }
    },
    computed: {
      isPlaying(): boolean {
        return this.$store.getters['player/isPlaying']
      },
      playingTrackId(): any {
        return this.$store.getters['player/trackId']
      },
      playableTracks(): Track[] {
        return (this.files?.files || [])
      },
      path() {
        return this.pathString.split('/')
      }
    },
    watch: {
      pathID: {
        immediate: true,
        handler(value: string) {
          this.filesStore.load(value === '' ? '' : '/' + value)
        }
      }
    },
    methods: {
      async playNow() {
        return this.$store.dispatch('player/playNow', {
          tracks: this.playableTracks,
        })
      },
      async shuffleNow() {
        return this.$store.dispatch('player/shuffleNow', {
          tracks: this.playableTracks,
        })
      },
      async playTrack(track: Track) {
        if (track.id === this.playingTrackId) {
          return this.$store.dispatch('player/playPause')
        }
        const index = this.playableTracks.findIndex((x: any) => x.id === track.id)
        return this.$store.dispatch('player/playTrackList', {
          index,
          tracks: this.playableTracks,
        })
      },
      pathPush(id: string) {
        const pathID = this.pathID === '' ? id : [...this.pathID.split('/'), id].join('/')
        this.$router.push({ path: `/files/${pathID}` })
      },
      pathPop() {
        const pathID = this.pathID.split('/').slice(0, -1).join('/')
        this.$router.push({ path: `/files/${pathID}` })
      },
      pathSlice(idx: number) {
        const pathID = this.pathID.split('/').slice(0, idx).join('/')
        this.$router.push({ path: `/files/${pathID}` })
      }
    }

  })
</script>

<style scoped>
.bc {
  display: flex;
  overflow-x: overlay;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bc-item + .bc-item::before {
    padding-right: 0.3rem;
    padding-left: 0.3rem;
    color: #6c757d;
    content: "/";
}
</style>