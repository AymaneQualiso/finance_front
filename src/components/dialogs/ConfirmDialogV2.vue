<script setup>
const props = defineProps({
  confirmationQuestion: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
  hideOnConfirmation: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'confirm',
  'cancel',
])


const updateModelValue = val => {
  emit('update:isDialogVisible', val)
}

const onConfirmation = () => {
  emit('confirm')
  if(props.hideOnConfirmation)
    updateModelValue(false)
}

const onCancel = () => {
  emit('cancel')
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <!-- 👉 Confirm Dialog -->
  <VDialog
    max-width="500"
    persistent
    :model-value="props.isDialogVisible"
    :loading="loading"
    @update:model-value="updateModelValue"
  >
    <VCard
      class="text-center px-10 py-6"
      :loading="loading"
    >
      <VCardText>
        <VBtn
          icon
          variant="outlined"
          color="warning"
          class="my-4"
          style=" block-size: 88px;inline-size: 88px; pointer-events: none;"
        >
          <span class="text-5xl">!</span>
        </VBtn>

        <h6 class="text-lg font-weight-medium">
          {{ props.confirmationQuestion }}
        </h6>
      </VCardText>

      <VCardText class="d-flex align-center justify-center gap-2">
        <VBtn
          color="secondary"
          variant="tonal"
          @click="onCancel"
        >
          Cancel
        </VBtn>
        <VBtn
          variant="elevated"
          @click="onConfirmation"
        >
          Confirm
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
