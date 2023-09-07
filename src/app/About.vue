<template>
  <b-modal size="md" hide-header hide-footer :visible="visible" @change="$emit('close')">
    <div class="d-flex align-items-center justify-content-center mb-3">
      <Logo />
    </div>
    <div>

      <dl class="row">
        <dt class="col-sm-3">GitHub</dt>
        <dd class="col-sm-9">
          <ExternalLink href="https://github.com/archekb/xonic-ui">
            https://github.com/archekb/xonic-ui
          </ExternalLink>
        </dd>
        <dt class="col-sm-3">Version</dt>
        <dd class="col-sm-9">{{ version }} {{ newVersion && version !== newVersion ? `(new version ${newVersion} is available)` : '(actual)' }}</dd>
        <dt class="col-sm-3">Build</dt>
        <dd class="col-sm-9">{{ build }}</dd>
        <dt class="col-sm-3">Build date</dt>
        <dd class="col-sm-9">{{ buildDate }}</dd>
      </dl>

      <div>
        fork of
        <ExternalLink href="https://github.com/tamland/airsonic-refix">
          Airsonic-refix
        </ExternalLink>
      </div>

    </div>
    <div class="d-flex justify-content-end">
      <button class="btn btn-secondary" @click="$emit('close')">
        Close
      </button>
    </div>
  </b-modal>
</template>
<script lang="ts">
  import axios from 'axios'
  import { defineComponent } from 'vue'
  import Logo from './Logo.vue'

  export default defineComponent({
    components: {
      Logo,
    },
    props: {
      visible: { type: Boolean, required: true },
    },
    data() {
      return {
        version: process?.env?.VUE_APP_VERSION,
        newVersion: null,
      }
    },
    computed: {
      build: () => process.env.VUE_APP_BUILD,
      buildDate: () => process.env.VUE_APP_BUILD_DATE,
    },
    created() {
      axios.get('https://raw.githubusercontent.com/archekb/xonic-ui/main/package.json').then(responce => { this.newVersion = responce.data?.version })
    },
  })
</script>
