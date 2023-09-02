<template>
  <div v-if="album">
    <Hero :image="album.image">
      <h1>
        {{ album.name }}
        <b-button variant="link" class="p-0" @click="toggleFavourite">
          <Icon :icon="isFavourite ? 'heart-fill' : 'heart'" />
        </b-button>
      </h1>
      <p>
        by
        <router-link :to="{name: 'artist', params: { id: album.artistId }}">
          {{ album.artist }}
        </router-link>
        <span v-if="album.year"> • {{ album.year }}</span>
        <span v-if="album.genreId"> •
          <router-link :to="{name: 'genre', params: { id: album.genreId }}">
            {{ album.genreId }}
          </router-link>
        </span>
      </p>
      <div class="text-nowrap">
        <b-button variant="secondary" class="mr-2" @click="playNow">
          <Icon icon="play" /> Play
        </b-button>
        <b-button variant="secondary" class="mr-2" @click="shuffleNow">
          <Icon icon="shuffle" /> Shuffle
        </b-button>
        <OverflowMenu class="px-1">
          <ContextMenuItem icon="plus" @click="setNextInQueue">
            Play next
          </ContextMenuItem>
          <ContextMenuItem icon="plus" @click="addToQueue">
            Add to queue
          </ContextMenuItem>
          <ContextMenuItem v-if="shareStore.supported" icon="share" @click="showShare = true">
            Share
          </ContextMenuItem>
          <ContextMenuItem v-if="true" icon="download" @click="mainStore.downloadAll(album.name, album.tracks)">
            Download all
          </ContextMenuItem>
        </OverflowMenu>
      </div>
    </Hero>
    <div class="row">
      <div class="col">
        <TrackList :tracks="album.tracks" no-album />
      </div>
    </div>
    <ShareModal :visible.sync="showShare" :tracks="album.tracks" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import TrackList from '@/shared/components/track/TrackList.vue'
  import { Album } from '@/shared/api'
  import { useFavouriteStore } from '@/library/favourite/store'
  import { useShareStore } from '@/library/share/store'
  import ShareModal from '@/library/share/ShareModal.vue'
  import { useMainStore } from '@/shared/store'

  export default defineComponent({
    components: {
      TrackList,
      ShareModal
    },
    props: {
      id: { type: String, required: true }
    },
    setup() {
      return {
        favouriteStore: useFavouriteStore(),
        shareStore: useShareStore(),
        mainStore: useMainStore()
      }
    },
    data() {
      return {
        album: null as null | Album,
        showShare: false,
      }
    },
    computed: {
      isFavourite(): boolean {
        return !!this.favouriteStore.albums[this.id]
      },
    },
    async created() {
      this.album = await this.$api.getAlbumDetails(this.id)
    },
    methods: {
      playNow() {
        return this.$store.dispatch('player/playNow', {
          tracks: this.album!.tracks,
        })
      },
      shuffleNow() {
        return this.$store.dispatch('player/shuffleNow', {
          tracks: this.album!.tracks,
        })
      },
      setNextInQueue() {
        if (this.album) {
          return this.$store.dispatch('player/setNextInQueue', this.album.tracks)
        }
      },
      addToQueue() {
        if (this.album) {
          return this.$store.dispatch('player/addToQueue', this.album.tracks)
        }
      },
      toggleFavourite() {
        return this.favouriteStore.toggle('album', this.id)
      },
    }
  })
</script>
