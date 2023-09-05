<template>
  <ContentLoader v-slot v-if="supported" :loading="shares === null">
    <div class="d-flex align-items-center mb-2">
      <h1 class="mb-0 mr-2 text-truncate">
        Shares
      </h1>
    </div>
    <BaseTable v-if="shares?.length > 0">
      <BaseTableHead>
        <td>Tracks</td>
        <td>Created</td>
        <td>Expires</td>
        <td>Last visit</td>
        <td>Visits</td>
        <td><Icon icon="shield-check"/></td>
      </BaseTableHead>
      <tbody>
        <tr v-for="(item, index) in shares" :key="item.id" @click="$router.push({name: 'share', params: { id: item.id } })">
          <td>{{ index + 1 }}</td>
          <td>
            {{ item.description }}
          </td>
          <td>{{ item.tracks?.length }}</td>
          <td>{{ item.created ? item.created.toLocaleString() : '-' }}</td>
          <td>{{ item.expires ? item.expires.getFullYear() > 1 ? item.expires.toLocaleString() : '-' : '-' }}</td>
          <td>{{ item.lastVisited ? item.lastVisited.getFullYear() > 1 ? item.lastVisited.toLocaleString() : '-' : '-' }}</td>
          <td>{{ item.visitCount }}</td>
          <td><Icon icon="shield-check" v-if="item?.protected" /></td>
          <CellMenu>
            <ContextMenuItem icon="share" @click="copyToClipboard(item.url)">
              Copy link
            </ContextMenuItem>
            <ContextMenuItem icon="new-window" @click="open(item.url)">
              Open
            </ContextMenuItem>
            <ContextMenuItem icon="edit" @click="edit(item)">
              Edit
            </ContextMenuItem>
            <b-dropdown-divider />
            <ContextMenuItem icon="trash" variant="danger" @click="deleteShare(item)">
              Delete
            </ContextMenuItem>
          </CellMenu>
        </tr>
      </tbody>
    </BaseTable>
    <EmptyIndicator v-else />

    <EditModal :visible.sync="showEditModal" :item="item" @confirm="updateShare">
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
  import EditModal from '@/shared/components/EditModal.vue'
  import { useShareStore } from '@/library/share/store'
  import BaseTable from '@/shared/components/BaseTable.vue'
  import BaseTableHead from '@/shared/components/BaseTableHead.vue'
  import CellMenu from '@/shared/components/CellMenu.vue'
  import { Share } from '@/shared/api'
  import { BFormDatepicker } from 'bootstrap-vue'
  import { useMainStore } from '@/shared/store'

  export default defineComponent({
    components: {
      BaseTable,
      BaseTableHead,
      CellMenu,
      EditModal,
      BFormDatepicker
    },
    // props: {
    //   id: { type: String, required: true }
    // },
    setup() {
      const storeShare = useShareStore()
      const { supported, shares } = storeToRefs(storeShare)
      return { supported, shares, storeShare }
    },
    data() {
      return {
        showEditModal: false,
        item: null as null | Share
      }
    },
    async created() {
      await this.storeShare.load()
    },
    methods: {
      edit(item: Share) {
        this.item = item
        this.showEditModal = true
      },
      updateShare(s: Share) {
        this.storeShare.update({ id: s.id, description: s.description, expires: s.expires?.valueOf(), secret: s.secret, download: s.download })
      },
      async deleteShare(item: Share) {
        await this.storeShare.delete(item.id)
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
