<script setup>
const t = inject("t")
const showSnackbar = inject("showSnackbar")

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
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
  nameFirstChoice: {
    type: String,
    required: true,
  },
  nameSecondChoice: {
    type: String,
    required: false,
    default: '',
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'confirm',
  'confirmSecond',
  'cancel',
])


const updateModelValue = val => {
  emit('update:isDialogVisible', val)
}

const onConfirmFirstChoise = () => {
  emit('confirm')
  if(props.hideOnConfirmation)
    updateModelValue(false)
}

const onConfirmationSecondChoise = () => {
  emit('confirmSecond')
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
    max-width="600"
    persistent
    :model-value="props.isDialogVisible"
    :loading="loading"
    @update:model-value="updateModelValue"
  >
    <DialogCloseBtn @click="onCancel" :disabled="loading" />
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
          {{ $t(props.confirmationQuestion) }}
        </h6>
      </VCardText>

      <VCardText class="d-flex align-center justify-center gap-2">
        <VRow>
          <VCol cols="12">
            <VBtn
              v-if="!nameSecondChoice"
              color="secondary"
              variant="tonal"
              @click="onCancel"
            >
              {{ $t('Cancel') }}
            </VBtn>
            <VBtn
              v-else
              color="info"
              variant="elevated"
              @click="onConfirmationSecondChoise"
              width="30em"
            >
              {{ $t(nameSecondChoice) }}
            </VBtn>
          </VCol>
          <VCol cols="12">
            <VBtn
              variant="elevated"
              @click="onConfirmFirstChoise"
              width="30em"
            >
              {{ $t(nameFirstChoice) }}
            </VBtn>
          </VCol>
        </VRow>
    
        
      </VCardText>
    </VCard>
  </VDialog>
</template>
