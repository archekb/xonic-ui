<template>
  <ContentLoader v-if="error == null" v-slot :loading="playlist == null">
    <div class="d-flex align-items-center mb-2">
      <h1 class="mb-0 mr-2 text-truncate">
        {{ playlist.name }}
      </h1>
      <span class="align-self-start">{{ playlist.tracks?.length ? `${playlist.tracks?.length} ${playlist.tracks?.length > 1 ? 'tracks' : 'track' }` : '' }}</span>

      <span v-if="playlist.isPublic" class="badge badge-light badge-pill mr-2">
        Public
      </span>

      <div class="ml-auto">
        <div class="d-none d-sm-block">
          <b-button variant="secondary" :disabled="playlist.tracks.length === 0" class="mr-2" @click="playNow">
            <Icon icon="play" /> Play
          </b-button>
          <b-button variant="secondary" :disabled="playlist.tracks.length === 0" @click="shuffleNow">
            <Icon icon="shuffle" /> Shuffle
          </b-button>
        </div>
      </div>

      <OverflowMenu class="ml-3">
        <ContextMenuItem v-if="isRandom" icon="save" @click="showPlaylist = true">
          Add to playlist
        </ContextMenuItem>
        <ContextMenuItem v-if="!isRandom" icon="edit" @click="showEditModal = true">
          Edit
        </ContextMenuItem>
        <ContextMenuItem v-if="shareStore.supported" icon="share" @click="showShare = true">
          Share
        </ContextMenuItem>
        <ContextMenuItem v-if="true" icon="download" @click="mainStore.downloadAll(playlist.name, playlist.tracks)">
          Download all
        </ContextMenuItem>
        <b-dropdown-divider v-if="!isRandom" />
        <ContextMenuItem v-if="!isRandom" icon="trash" variant="danger" @click="deletePlaylist()">
          Delete
        </ContextMenuItem>
      </OverflowMenu>
    </div>

    <p v-if="playlist.comment" class="text-muted">
      {{ playlist.comment }}
    </p>

    <div class="d-block d-sm-none my-2">
      <b-button variant="secondary" :disabled="playlist.tracks.length === 0" class="mr-2" @click="playNow">
        <Icon icon="play" /> Play
      </b-button>
      <b-button variant="secondary" :disabled="playlist.tracks.length === 0" @click="shuffleNow">
        <Icon icon="shuffle" /> Shuffle
      </b-button>
    </div>

    <TrackList v-if="playlist.tracks.length > 0" :tracks="playlist.tracks">
      <template #context-menu="{index}">
        <b-dropdown-divider />
        <ContextMenuItem icon="trash" variant="danger" @click="removeTrack(index)">
          Remove
        </ContextMenuItem>
      </template>
    </TrackList>
    <EmptyIndicator v-else />

    <EditModal :visible.sync="showEditModal" :item="playlist" @confirm="updatePlaylist">
      <template #title>
        Edit playlist
      </template>
      <template #default="{ item }">
        <div class="form-group">
          <label>Name</label>
          <input v-model="item.name" class="form-control" type="text">
        </div>
        <div class="form-group">
          <label>Comment</label>
          <textarea v-model="item.comment" class="form-control" />
        </div>
        <div class="form-group">
          <label class="mb-0">Public (visible for other server users)</label>
          <b-form-checkbox v-model="item.isPublic" switch />
        </div>
      </template>
    </EditModal>

    <PlaylistModal :visible.sync="showPlaylist" :tracks="playableTracks" />
    <ShareModal :visible.sync="showShare" :tracks="playableTracks" />
  </ContentLoader>

  <EmptyIndicator v-else-if="error">
    Playlist can't be loaded, {{ error?.message?.toLowerCase() }}
    <div class="d-flex flex-column align-items-center mt-4">
      <b-button v-if="!isRandom" variant="secondary" class="text-danger" @click="deletePlaylist()">
        <Icon icon="trash" /> Try to delete playlist
      </b-button>
    </div>
  </EmptyIndicator>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import TrackList from '@/shared/components/track/TrackList.vue'
  import EditModal from '@/shared/components/EditModal.vue'
  import { usePlaylistStore } from '@/library/playlist/store'
  import { useShareStore } from '@/library/share/store'
  import ShareModal from '@/library/share/ShareModal.vue'
  import { Track } from '@/shared/api'
  import { useMainStore } from '@/shared/store'
  import PlaylistModal from '@/library/playlist/PlaylistModal.vue'

  export default defineComponent({
    components: {
      TrackList,
      EditModal,
      ShareModal,
      PlaylistModal,
    },
    props: {
      id: { type: String, required: true }
    },
    setup() {
      return {
        playlistStore: usePlaylistStore(),
        shareStore: useShareStore(),
        mainStore: useMainStore(),
      }
    },
    data() {
      return {
        playlist: null as any,
        showEditModal: false,
        error: null as any,
        showShare: false,
        showPlaylist: false,
      }
    },
    computed: {
      isRandom(): boolean {
        return this.id === 'random'
      },
      isPlaying(): boolean {
        return this.$store.getters['player/isPlaying']
      },
      playableTracks(): Track[] {
        return (this.playlist?.tracks || [])
      }
    },
    watch: {
      id: {
        immediate: true,
        handler(value: string) {
          this.playlist = null
          this.$api.getPlaylist(value)
            .then(playlist => {
              this.playlist = playlist
              this.error = null
            })
            .catch(e => {
              this.error = e
            })
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
      removeTrack(index: number) {
        this.playlist.tracks.splice(index, 1)
        return this.playlistStore.removeTrack(this.id, index)
      },
      updatePlaylist(value: any) {
        this.playlist = value
        return this.playlistStore.update(this.playlist)
      },
      deletePlaylist() {
        return this.playlistStore.delete(this.id).then(() => {
          this.$router.replace({ name: 'playlists' })
        })
      },
    }
  })
</script>
