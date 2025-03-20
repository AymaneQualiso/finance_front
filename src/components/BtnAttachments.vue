

<template>
  <VBtn
    :icon="!withText"
    :variant="withText ? 'flat' : 'text'"
    @click="isDialogVisible = true"
  >
    <div v-if="withText">
      {{ $t('Upload attachments.Upload attachments') }}
    </div>
    <VIcon
      :class="withText ? 'ml-2' : ''"
      size="28"
      icon="tabler-file-time"
    />
    <VTooltip
      v-if="!withText"
      activator="parent"
      location="top"
    >
      <span>{{ $t('Upload attachments.Attachments Uploaded') }}</span>
      <span v-if="withForm">{{ $t('Upload attachments.Upload attachments') }}</span>
    </VTooltip>
  </VBtn>
  <UploadAttachments 
    :is-visible="isDialogVisible" 
    :model-able="modelAble"
    :with-form="withForm"
    :model="model"
    @close="onClose"
    @upload-file="onUploadFile"
    @on-delete="onDelete"
    @on-download="onDownloadFile"
  />
</template>

<script setup>
const props = defineProps({
  modelAble: {
    type: Object,
    required: true,
  },
  withForm: {
    type: Boolean,
    default: false,
  },
  withText: {
    type: Boolean,
    default: false,
  },
  model: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['onUploadFile', 'onDelete', 'onDownloadFile'])
const isDialogVisible = ref(false)

function onUploadFile(item){
  emits('onUploadFile', item)
}
function onDelete(item){
  emits('onDelete', item)
}
function onDownloadFile(item){
  emits('onDownloadFile', item)
}
function onClose(){
  isDialogVisible.value = false
}
</script>
