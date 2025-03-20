<script setup>
import useSnackbar from './snackbar.store'

const { snackbar } = storeToRefs(useSnackbar())
</script>

<template>
  <VSnackbar
    v-model="snackbar.show"
    v-bind="snackbar.props"
  >
    {{ snackbar.message }}
    <template #actions>
      <VBtn
        color="white"
        icon="tabler-x"
        @click="snackbar.show = false"
      />
    </template>
  </VSnackbar>
</template>
