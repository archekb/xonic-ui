<template>
  <div>
    <div class="min-vh-100 d-flex">
      <main class="container-fluid py-2">
        <slot />
      </main>
    </div>
    <Player share />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import Player from '@/player/Player.vue'

  export default defineComponent({
    components: {
      Player,
    },
  })
</script>

<style lang="scss">
  main {
    margin-bottom: 80px;
    overflow-x: hidden;
  }
</style>
