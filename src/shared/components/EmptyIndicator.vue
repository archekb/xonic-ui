<template functional>
  <div class="d-flex flex-column align-items-center justify-content-center h-100">
    <Icon icon="stack" class="empty-icon" />
    <div class="mt-4 text-muted">
      <slot>
        {{ props.label || 'Empty' }}
      </slot>
    </div>
  </div>
</template>
<style scoped>
  .empty-icon{
    font-size: 8em;
    color: #222
  }
</style>
