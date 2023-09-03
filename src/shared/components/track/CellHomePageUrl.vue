<template functional>
  <td class="d-none d-md-table-cell">
    <template v-if="props.track.homepageUrl">
      <ExternalLink :href="props.track.homepageUrl">
        {{ props.track.homepageUrl }}
      </ExternalLink>
    </template>
    <template v-else>
      -
    </template>
  </td>
</template>
