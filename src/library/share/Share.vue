<template>
  <ContentLoader v-if="supported" v-slot :loading="share == undefined">
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

      <OverflowMenu class="ml-3">
        <ContextMenuItem icon="share" @click="copyToClipboard(share.url)">
          Copy link
        </ContextMenuItem>
        <ContextMenuItem icon="new-window" @click="open(share.url)">
          Open
        </ContextMenuItem>
        <ContextMenuItem icon="edit" @click="showEditModal = true">
          Edit
        </ContextMenuItem>
        <ContextMenuItem v-if="true" icon="download" @click="mainStore.downloadAll(share.description, share.tracks)">
          Download all
        </ContextMenuItem>
        <b-dropdown-divider />
        <ContextMenuItem icon="trash" variant="danger" @click="deleteShare()">
          Delete
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

    <TrackList v-if="share.tracks.length > 0" :tracks="share.tracks">
      <template #context-menu="{item}">
        <b-dropdown-divider />
        <ContextMenuItem icon="trash" variant="danger" @click="removeTrack(item.id)">
          Remove
        </ContextMenuItem>
      </template>
    </TrackList>

    <EmptyIndicator v-else />

    <EditModal :visible.sync="showEditModal" :item="share" @confirm="updateShare">
      <template #title>
        Edit Share
      </template>
      <template #default="{ item }">
        <div class="form-group">
          <label>Description (title)</label>
          <input v-model="item.description" class="form-control" type="text">
        </div>
        <div class="form-group">
          <label>Expiration</label>
          <b-form-datepicker v-model="item.expires" class="mb-2" :min="new Date(new Date().setDate(new Date().getDate() + 1))" value-as-date />
        </div>
        <div class="form-group">
          <label>Protect by secret phrase</label>
          <input v-model="item.secret" class="form-control" type="text">
        </div>
        <div class="form-group">
          <label class="mb-0">Download allowed</label>
          <b-form-checkbox v-model="item.download" switch />
        </div>
      </template>
    </EditModal>
  </ContentLoader>
  <EmptyIndicator v-else label="Shares are not supported" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { storeToRefs } from 'pinia'
  import TrackList from '@/shared/components/track/TrackList.vue'
  import EditModal from '@/shared/components/EditModal.vue'
  import { useShareStore } from '@/library/share/store'
  import { Share, Track } from '@/shared/api'
  import { useMainStore } from '@/shared/store'
  import { BFormDatepicker } from 'bootstrap-vue'

  export default defineComponent({
    components: {
      TrackList,
      EditModal,
      BFormDatepicker,
    },
    props: {
      id: { type: String, required: true }
    },
    setup() {
      const shareStore = useShareStore()
      const { supported } = storeToRefs(shareStore)
      return {
        supported,
        shareStore,
        mainStore: useMainStore(),
      }
    },
    data() {
      return {
        share: undefined as undefined | Share,
        showEditModal: false,
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
      }
    },
    watch: {
      id: {
        immediate: true,
        async handler(value: string) {
          this.share = await this.shareStore.get(value)
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
      async removeTrack(id: string) {
        await this.shareStore.removeTrack(this.id, id)
        this.share = await this.shareStore.get(this.id)
      },
      async updateShare(s: Share) {
        await this.shareStore.update({ id: s.id, description: s.description, expires: s.expires?.valueOf(), secret: s.secret, download: s.download })
        this.share = await this.shareStore.get(s.id)
      },
      deleteShare() {
        return this.shareStore.delete(this.id).then(() => {
          this.$router.replace({ name: 'shares' })
        })
      },
      async copyToClipboard(url: string) {
        try {
          await navigator.clipboard.writeText(url)
          useMainStore().addNotification({ message: 'Successfully link copied to clipboard', title: 'Share' })
        } catch (e) {
          useMainStore().addNotification({ message: 'Failed link copy to clipboard', title: 'Share', type: 'danger' })
        }
      },
      async open(url: string) {
        window?.open(url, '_blank')?.focus()
      }
    }
  })
</script>
