<template>
  <nav class="nav flex-column">
    <div class="sidebar-brand d-flex justify-content-between align-items-end">
      <Logo />
      <button class="btn btn-link btn-lg p-0 m-0 d-md-none" @click="store.hideMenu">
        <Icon icon="x" />
      </button>
    </div>

    <router-link v-if="settings.includes('ui.menu.list', 'discover')" class="nav-link" :to="{name: 'discover'}" exact>
      <Icon icon="discover" class="" /> Discover
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'playing')" class="nav-link" :to="{name: 'playing'}">
      <Icon icon="playlist" /> Playing
    </router-link>

    <small class="sidebar-heading text-muted">
      Library
    </small>

    <router-link v-if="settings.includes('ui.menu.list', 'albums')" class="nav-link" :to="{name: 'albums-default'}">
      <Icon icon="library" /> Albums
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'artists')" class="nav-link" :to="{name: 'artists'}">
      <Icon icon="library" /> Artists
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'genres')" class="nav-item nav-link" :to="{name: 'genres'}">
      <Icon icon="library" /> Genres
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'playlists')" class="nav-link" :to="{name: 'playlists'}">
      <Icon icon="list" /> Playlists
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'favourites')" class="nav-link" :to="{name: 'favourites'}">
      <Icon icon="heart" /> Favourites
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'shares')" class="nav-link" :to="{name: 'shares'}">
      <Icon icon="share" /> Shares
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'podcasts')" class="nav-link" :to="{name: 'podcasts'}">
      <Icon icon="podcast" /> Podcasts
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'radio')" class="nav-link" :to="{name: 'radio'}">
      <Icon icon="radio" /> Radio
    </router-link>

    <router-link v-if="settings.includes('ui.menu.list', 'files')" class="nav-link" :to="{name: 'files'}">
      <Icon icon="files" /> Files
    </router-link>

    <PlaylistNav v-if="settings.get('ui.menu.playlists')" />
  </nav>
</template>
<script lang="ts">
  import { defineComponent } from 'vue'
  import Logo from './Logo.vue'
  import PlaylistNav from '@/library/playlist/PlaylistNav.vue'
  import { useMainStore } from '@/shared/store'
  import { useSettingsStore } from '@/settings/store'

  export default defineComponent({
    components: {
      Logo,
      PlaylistNav,
    },
    setup() {
      return {
        settings: useSettingsStore(),
        store: useMainStore(),
      }
    },
  })
</script>
