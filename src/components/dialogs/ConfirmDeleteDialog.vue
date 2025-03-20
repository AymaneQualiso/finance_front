
<template>
  <VDialog
    v-model="isVisible"
    persistent
    width="500"
  >
    <DialogCloseBtn @click="emits('close')" :disabled="loading" />
    <VCard :title="$t('Confirm')">
      <VCardText v-if="message">
        {{ message }}
      </VCardText>
      <VCardText v-if="messageError" class="text-error font-weight-bold">
        {{ messageError }}
      </VCardText>
      <VCardText v-if="!message">
        {{ $t('Deleting msg') }}
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="emits('close')"
          :disabled="loading"
        >
          {{ $t('Cancel') }}
        </VBtn>
        <VBtn @click="confirm" :loading="loading" :disabled="loading">
          {{ $t('Confirm') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "",
  },
    messageError: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
    require: false
  },
})

const emits = defineEmits(['close', 'onDelete'])
const isVisible = ref(false)
const loading = ref(false)

watch(()=> props.isDialogVisible,
  val=> {
    isVisible.value = val
  },
  { immediate: true })
  watch(() => props.isLoading,
  (val) => {
    loading.value = val
  },
  { immediate: true }
)
function confirm(){
  emits('onDelete')
}
</script>
