<template>
  <div v-if="secretReqired && share == null">
    <div class="row align-items-center h-100 mt-5">
      <div class="mx-auto card" style="width: 22rem">
        <b-overlay rounded :show="authLoad" opacity="0.1">
          <div class="card-body">
            <div class="d-flex mb-2">
              <Logo class="mx-auto" />
            </div>
            <div class="form-group">
              <label>Secret</label>
              <input v-model="secret" type="text" class="form-control" :class="{'is-invalid': !!error}">
            </div>
            <div v-if="error" class="text-danger mb-3">
              {{ error }}
            </div>
            <button class="btn btn-primary btn-block" :disabled="authLoad" @click="load">
              <span v-show="false" class="spinner-border spinner-border-sm" /> Ok
            </button>
          </div>
        </b-overlay>
      </div>
    </div>
  </div>

  <ContentLoader v-else-if="!error" v-slot :loading="share == null">
    <div class="d-flex align-items-center mb-2">
      <h1 class="mb-0 mr-2 text-truncate">
        {{ share.description }}
      </h1>

      <span class="align-self-start">{{ share.tracks?.length ? `${share.tracks?.length} ${share.tracks?.length > 1 ? 'tracks' : 'track' }` : '' }}</span>

      <div class="ml-auto">
        <div class="d-none d-sm-block">
          <b-button variant="secondary" :disabled="share.tracks.length === 0" class="mr-2" @click="playNow">
            <Icon icon="play" /> Play
          </b-button>
          <b-button variant="secondary" :disabled="share.tracks.length === 0" @click="shuffleNow">
            <Icon icon="shuffle" /> Shuffle
          </b-button>
        </div>
      </div>

      <OverflowMenu v-if="share.download" class="ml-3">
        <ContextMenuItem v-if="true" icon="download" @click="mainStore.downloadAll(share.name, share.tracks)">
          Download all
        </ContextMenuItem>
      </OverflowMenu>
    </div>

    <div class="d-block d-sm-none my-2">
      <b-button variant="secondary" :disabled="share.tracks.length === 0" class="mr-2" @click="playNow">
        <Icon icon="play" /> Play
      </b-button>
      <b-button variant="secondary" :disabled="share.tracks.length === 0" @click="shuffleNow">
        <Icon icon="shuffle" /> Shuffle
      </b-button>
    </div>

    <TrackList v-if="share.tracks.length > 0" :tracks="share.tracks" share>
      <template v-if="share.download" #actions="{item: track}">
        <OverflowMenu>
          <ContextMenuItem v-if="!track.isStream" icon="download" @click="downloadTrack(track)">
            Download
          </ContextMenuItem>
        </OverflowMenu>
      </template>
    </TrackList>

    <EmptyIndicator v-else />
  </ContentLoader>
  <EmptyIndicator v-else label="Share not found" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import TrackList from '@/shared/components/track/TrackList.vue'
  import { Track } from '@/shared/api'
  import { config } from '@/shared/config'
  import Logo from '@/app/Logo.vue'
  import { BOverlay } from 'bootstrap-vue'
  import { toQueryString } from '@/shared/utils'

  export default defineComponent({
    components: {
      TrackList,
      Logo,
      BOverlay
    },
    props: {
      id: { type: String, required: true },
      srv: { type: String, default: '' },
    },
    data() {
      return {
        authLoad: false,

        secretReqired: false,
        secret: window.sessionStorage.getItem(`xonic-share-${this.id}-${this.srv}`) || '',

        error: '',
        share: null as any,
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
        return (this.share?.tracks || [])
      },
      getSrv() {
        try {
          const url = new URL(this.srv || config.serverUrl)
          if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
          return this.srv || config.serverUrl
        } catch (e) {
          return null
        }
      },
    },
    watch: {
      id: {
        async handler() {
          await this.load()
        }
      },
      srv: {
        async handler() {
          await this.load()
        }
      },
    },
    async created() {
      this.$store.commit('player/setQueue', [])
      await this.load()
    },
    methods: {
      async load() {
        if (!this.getSrv) {
          this.error = 'Not valid server url'
          return
        }

        try {
          this.error = ''
          this.$api.setAuthToShare(this.getSrv, toQueryString({ shareId: this.id, ...(this.secret ? { secret: this.secret } : {}) }))
          const share = await this.$api.getSharePublic(this.id, this.secret)
          if (!share) throw new Error('')

          this.share = share
          if (share.tracks) {
            this.$store.dispatch('player/addToQueue', share.tracks)
            this.$store.dispatch('player/resetQueue')
          }
          window.sessionStorage.setItem(`xonic-share-${this.id}-${this.getSrv}`, this.secret)
        } catch (e) {
          console.log(e)
          if (`${e}`.includes('auth required')) {
            if (!this.secretReqired) {
              this.secretReqired = true
            } else {
              this.error = 'Wrong secret'
            }
            return
          }
          this.error = `${e}`
        }
      },
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
      downloadTrack(item: Track) {
        window.location.href = this.$api.getDownloadUrl(item.id)
      },
    }
  })
</script>
