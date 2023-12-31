<template>
  <BaseTable>

    <BaseTableHead>
      <th v-if="!noArtist" class="text-left d-none d-lg-table-cell">
        Artist
      </th>
      <th v-if="!noAlbum" class="text-left d-none d-md-table-cell">
        Album
      </th>
      <th v-if="!noDuration" class="text-right d-none d-md-table-cell">
        Duration
      </th>
      <th v-if="homepageUrl" class="text-left d-none d-md-table-cell">
        Home Page
      </th>
    </BaseTableHead>

    <tbody class="text-break">
      <tr v-for="(item, index) in tracks" :key="index"
          :class="{'active': item.id === playingTrackId}"
          :draggable="true" @dragstart="dragstart(item, $event)"
          @click="play(index)">
        <CellTrackNumber
          :active="item.id === playingTrackId && isPlaying"
          :value="item.track || index + 1"
        />
        <CellTitle :track="item" />
        <CellArtist v-if="!noArtist" :track="item" :share="share" />
        <CellAlbum v-if="!noAlbum" :track="item" :share="share" />
        <CellDuration v-if="!noDuration" :track="item" />
        <CellHomePageUrl v-if="homepageUrl" :track="item" />
        <CellActions v-if="!share" :track="item">
          <slot name="context-menu" :index="index" :item="item" />
        </CellActions>
        <td v-else class="float-right">
          <slot name="actions" :index="index" :item="item" />
        </td>
      </tr>
    </tbody>

  </BaseTable>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue'
  import CellDuration from '@/shared/components/track/CellDuration.vue'
  import CellArtist from '@/shared/components/track/CellArtist.vue'
  import CellAlbum from '@/shared/components/track/CellAlbum.vue'
  import CellTrackNumber from '@/shared/components/track/CellTrackNumber.vue'
  import CellActions from '@/shared/components/track/CellActions.vue'
  import CellTitle from '@/shared/components/track/CellTitle.vue'
  import CellHomePageUrl from '@/shared/components/track/CellHomePageUrl.vue'
  import BaseTable from '@/shared/components/BaseTable.vue'
  import BaseTableHead from '@/shared/components/BaseTableHead.vue'
  import { Track } from '@/shared/api'

  export default defineComponent({
    components: {
      BaseTableHead,
      BaseTable,
      CellTitle,
      CellActions,
      CellTrackNumber,
      CellAlbum,
      CellArtist,
      CellDuration,
      CellHomePageUrl,
    },
    props: {
      share: { type: Boolean },
      tracks: { type: Array as PropType<Track[]>, required: true },
      noAlbum: { type: Boolean, default: false },
      noArtist: { type: Boolean, default: false },
      noDuration: { type: Boolean, default: false },
      homepageUrl: { type: Boolean, default: false },
    },
    computed: {
      isPlaying(): boolean {
        return this.$store.getters['player/isPlaying']
      },
      playingTrackId(): any {
        return this.$store.getters['player/trackId']
      },
    },
    methods: {
      play(index: number) {
        if (this.tracks[index].id === this.playingTrackId) {
          return this.$store.dispatch('player/playPause')
        }
        return this.$store.dispatch('player/playTrackList', {
          index,
          tracks: this.tracks,
        })
      },
      dragstart(item: any, event: any) {
        if (!item.isStream) {
          event.dataTransfer.setData('application/x-track-id', item.id)
        }
      },
    }
  })
</script>
