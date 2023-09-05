<template functional>
  <div class="d-flex flex-column h-100">
    <div v-if="props.loading" class="d-flex justify-content-center">
      <span class="spinner-border" />
    </div>
    <slot v-else />
  </div>
</template>
