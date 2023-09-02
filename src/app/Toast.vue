<template>
  <div>
    <b-toast v-for="n in notifications" :key="n.id" visible :title="n?.title" :variant="n?.type || 'secondary'" :no-auto-hide="n.notAutoHide" @hidden="removeNotification(n.id)">
      {{ n.message }}
      <div v-if="n.action">
        <b-button variant="link" @click="n.action.click" class="px-0">{{ n.action.title }}</b-button>
      </div>
    </b-toast>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useMainStore } from '@/shared/store'
  import { BToast } from 'bootstrap-vue'

  export default defineComponent({
    components: {
      BToast,
    },
    setup() {
      const mainStore = useMainStore()
      const { notifications } = storeToRefs(mainStore)
      return {
        notifications,
        removeNotification: mainStore.removeNotification,
      }
    },
  })
</script>
