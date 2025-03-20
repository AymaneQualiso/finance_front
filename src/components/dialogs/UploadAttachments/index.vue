<template>
  <VDialog
    v-model="isDialogVisible"
    width="800"
    persistent
  >
    <DialogCloseBtn @click="close" />
    <VCard
      :title="
        withForm || withSimpleForm 
          ? $t('Upload attachments.Upload attachments') 
          : $t('Upload attachments.Attachments Uploaded')"
    >
      <FormType
        v-if="withForm && $can(model + '.attachments_upload')"
        :types="records"
        :is-dialog-visible="isDialogVisible"
        @on-upload="upload"
      />

      <SimpleForm
        v-if="withSimpleForm"
        :is-dialog-visible="isDialogVisible"
        @on-upload="upload"
      />

      <List
        v-if="$can(model + '.attachments_index')"
        :model-able="modelAble"
        :model="model"
        :is-dialog-visible="isDialogVisible"
        :with-type="withType"
        :with-eye="withEye"
        v-model:is-download-loading="loadingDownload"
        v-model:is-delete-loading="LoadingDelete"
        @on-delete="onDelete"
        @on-download="onDownload"
      />
    </VCard>
  </VDialog>
</template>

<script setup>
import { useAttachmentTypeStore } from "@/stores"
import { isEmpty } from 'lodash'
import FormType from "./FormType.vue"
import List from "./List.vue"
import SimpleForm from "./SimpleForm.vue"

const props = defineProps({
  modelAble: {
    type: Object,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
  withForm: {
    type: Boolean,
    default: true,
  },
  withType: {
    type: Boolean,
    default: true,
  },
  withEye: {
    type: Boolean,
    default: false,
  },
  withSimpleForm: {
    type: Boolean,
    default: false,
  },
  model: {
    type: String,
    default: "",
  },
})
const loadingDownload = defineModel("isLoadingDownload", {
  type: Object,
  default: () => ({}),
});
const LoadingDelete = defineModel("isLoadingDelete", {
  type: Object,
  default: () => ({}),
});
const emits = defineEmits(['uploadFile', 'close', 'onDelete', 'onDownload'])
const attachmentTypeStore =  useAttachmentTypeStore()
const { records } = storeToRefs(attachmentTypeStore)

const isDialogVisible = computed(() => {
  return props.isVisible
})

onMounted(() => {
  if(isEmpty(records.value)) attachmentTypeStore.getRecords()
})

function onDelete(id){
  emits('onDelete', id)
}

function upload(form){
  form.modelable_type = props.modelAble.class
  form.modelable_id = props.modelAble.id
  emits('uploadFile', form)
}

function onDownload(item){
  emits('onDownload', item)
}

function close(){
  emits('close')
}
</script>
