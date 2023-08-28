<template>
  <b-modal :visible="visible" scrollable hide-backdrop :hide-footer="type !== 'new'" @change="cancel">
    <template #modal-header-close>
      <Icon icon="x" />
    </template>
    <template #modal-title>
      Share
    </template>

    <div v-if="type === 'new'">
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
    </div>

    <div v-else-if="type === 'url'" class="list-group list-group-flush" >
      <dl class="row">
        <dt class="col-sm-3">Description</dt>
        <dd class="col-sm-9">{{ item.description }}</dd>

        <dt class="col-sm-3">Created</dt>
        <dd class="col-sm-9">{{ item.created ? item.created.toLocaleString() : '-' }}</dd>

        <dt class="col-sm-3">Expires</dt>
        <dd class="col-sm-9">{{ item.expires ? item.expires.getFullYear() > 1 ? item.expires.toLocaleString() : '-' : '-' }}</dd>

        <dt class="col-sm-3">Last visit</dt>
        <dd class="col-sm-9">{{ item.lastVisited ? item.lastVisited.getFullYear() > 1 ? item.lastVisited.toLocaleString() : '-' : '-' }}</dd>

        <dt class="col-sm-3">Visits count</dt>
        <dd class="col-sm-9">{{ item.visitCount }}</dd>

        <dt class="col-sm-3">Protected</dt>
        <dd class="col-sm-9">{{ item?.protected ? 'Yes' : 'No' }}</dd>

        <dt class="col-sm-3">Tracks</dt>
        <dd class="col-sm-9">{{ item?.tracks?.length }}</dd>

        <dt class="col-sm-3">URL</dt>
        <dd class="col-sm-9"><a :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.url }}</a></dd>
      </dl>
      <div v-if="copiedToClipboard !== null" class="text-center mb-3">
        <Icon :icon="copiedToClipboard ? 'check' : 'x'" /> {{copiedToClipboard ? 'Successfully copied to clipboard' : 'Failed copy to clipboard'}}
      </div>
      <b-button type="button" class="list-group-item list-group-item-action text-truncate text-center" @click="copyToClipboard(item.url)">
        Copy URL
      </b-button>
    </div>

    <div class="list-group list-group-flush" v-else-if="type === 'select'">
      <b-button type="button" class="list-group-item list-group-item-action text-truncate text-center" @click="type = 'new'">
        Create new share
      </b-button>
      <b-button v-for="s in shares" :key="s.id" type="button" class="list-group-item list-group-item-action text-truncate" @click="save(s.id)" variant="outline-secondary">
        {{ s.description }}
      </b-button>
    </div>

    <template #modal-footer>
      <b-button  type="button" variant="primary" @click="save()">
        Create
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useShareStore } from '@/library/share/store'
  import { Share, Track } from '@/shared/api'
  import { BFormDatepicker } from 'bootstrap-vue'

  export default defineComponent({
    components: {
      BFormDatepicker
    },
    props: {
      visible: { type: Boolean, required: true },
      tracks: { type: Array<Track>, required: true },
    },
    data() {
      return {
        type: 'select',
        item: {} as Share,
        copiedToClipboard: null as null | boolean,
      }
    },
    setup() {
      const storeShare = useShareStore()
      const { shares, supported } = storeToRefs(storeShare)
      return {
        storeShare,
        shares,
        supported,
      }
    },
    async created() {
      await this.storeShare.load()
    },
    methods: {
      cancel() {
        this.$emit('update:visible', false)
        this.item = {} as Share
        this.type = 'select'
      },
      async save(shareId = '') {
        if (shareId) {
          await this.storeShare.addTracks(shareId, this.tracks.map(t => t.id))
          this.type = 'url'
        } else {
          this.item = await this.storeShare.create({ ...this.item, expires: this.item.expires?.valueOf(), id: this.tracks.map(t => t.id) })
          this.type = 'url'
        }
      },
      async copyToClipboard(url: string) {
        try {
          await navigator.clipboard.writeText(url)
          this.copiedToClipboard = true
        } catch (e) {
          this.copiedToClipboard = false
        }
      }
    }
  })
</script>
