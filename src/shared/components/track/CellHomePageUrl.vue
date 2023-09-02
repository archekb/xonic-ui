<template functional>
  <td class="d-none d-md-table-cell">
    <template v-if="props.track.homepageUrl">
      <a :href="props.track.homepageUrl" target="_blank" rel="noopener noreferrer" @click.native.stop>
        {{ props.track.homepageUrl }}
      </a>
    </template>
    <template v-else>
      -
    </template>
  </td>
</template>
