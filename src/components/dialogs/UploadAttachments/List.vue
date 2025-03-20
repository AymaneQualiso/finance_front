<template>
  <ConfirmDeleteDialog 
    :is-dialog-visible="isConfirmDialogVisible" 
    @close="isConfirmDialogVisible = false" 
    @on-delete="onConfirmDelete"
  />

  <VDialog
    width="550"
    height="700"
    :model-value="isImageModalVisible"
    persistent
  >
    <DialogCloseBtn @click="openImageModal" />
    <ImgPanel
      :items="pathImages"
      :index="indexImage"
      @close="openImageModal"
    />
  </VDialog>

  <VCardText>
    <div class="w-100 d-flex justify-center">
      <VProgressCircular
        v-if="isLoading"
        :size="40"
        width="3"
        color="primary"
        indeterminate
      />
    </div>
    
    <VRow v-if="!records.length && !isLoading">
      <VCol cols="12">
        <VAlert
          color="warning"
          style=" padding-block: 9px 9px;"
        >
          {{ $t('Upload attachments.Warning files msg') }} 
        </VAlert>
      </VCol>
    </VRow>
    <VTable
      v-if="records.length > 0 && !isLoading"
      class="text-no-wrap"
    >
      <thead>
        <tr>
          <th>
            {{ $t('Upload attachments.File') }}
          </th>
          <th v-if="withType">
            {{ $t('Upload attachments.File type') }}
          </th>
          <th>
            {{ $t('Upload attachments.Date') }}
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(record, idx) in records"
          :key="record.id"
        >
          <td>{{ record.file_name }}</td>
          <td v-if="withType">
            {{ record.attachment_type_name }}
          </td>
          <td>{{ formatDate(record.created_at) }}</td>
          <td>
            <div class="d-flex justify-end gap-3">
              <template v-if="!isLoadingDownload[record.id]">
                <VIcon
                  v-if="$can(model + '.attachments_download') && !isLoadingDelete[record?.id]"
                  icon="tabler-download"
                  color="primary"
                  @click="onDownload(record)"
                />
              </template>
              <template v-else>
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                ></v-progress-circular>
              </template>
              <template v-if="!isLoadingDelete[record.id]">
                <VIcon
                  v-if="$can(model + '.attachments_destroy') && !isLoadingDownload[record?.id]"
                  icon="tabler-trash"
                  color="error"
                  @click="onDelete(record)"
                />
              </template>
              <template v-else>
                <v-progress-circular
                  indeterminate
                  color="error"
                  size="24"
                ></v-progress-circular>
              </template>
              <TooltipIcon
                v-if="withEye"
                icon="tabler-eye"
                :tooltip-text="$t('countSesMd.show')"
                @click="openImageModal(records, idx, true)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </vtable>
  </VCardText>
</template>

<script setup>
import { useAttachmentStore } from "@/stores"
import { delay } from "lodash"
import ImgPanel from "./ImgPanel.vue"

const props = defineProps({
  modelAble: {
    type: Object,
    required: true,
  },
  isDialogVisible: {
    type: Boolean,
    default: false,
  },
  withType: {
    type: Boolean,
    default: false,
  },
  withEye: {
    type: Boolean,
    default: false,
  },
  model: {
    type: String,
    default: "",
  },
})
const isLoadingDownload = defineModel("isDownloadLoading", {
  type: Object,
  default: () => ({}),
});
const isLoadingDelete = defineModel("isDeleteLoading", {
  type: Object,
  default: () => ({}),
});
const emits = defineEmits(['onDelete', 'onDownload'])
const isConfirmDialogVisible = ref(false)
const rememberId = ref(null)
const attachmentStore = useAttachmentStore()
const { records, isLoading, filter } = storeToRefs(attachmentStore)

function onDelete(item){
  isConfirmDialogVisible.value = true
  rememberId.value = item.id
}

watch(() => props.isDialogVisible,
  () => {
    if(!props.isDialogVisible){
      delay(() => {
        records.value = []
        filter.value = []
      }, 300)
    }
  })

function onDownload(item){
  emits('onDownload', item)
}

function onConfirmDelete(){
  emits('onDelete', rememberId.value)
  isConfirmDialogVisible.value = false
  rememberId.value = null
}

const isImageModalVisible = ref(false)
const pathImages = ref([])
const indexImage = ref(0)
function openImageModal(records = [], idx = 0, show = false){
  isImageModalVisible.value = show
  pathImages.value = records
  indexImage.value = idx
}

watch(() => props.modelAble,
  () => {
    if(props.isDialogVisible){
      if(props.modelAble.id && (props.modelAble.id > 0 || typeof props.modelAble.id === 'string'))
      {
        attachmentStore.getRecords({
          'modelable_type': `App\\Model\\${props.modelAble.class}`,
          'modelable_id': props.modelAble.id,
        })
      }
      if(props.modelAble.ids && props.modelAble.ids.length)
      {
        attachmentStore.getRecords({
          'modelable_type': `App\\Model\\${props.modelAble.class}`,
          'modelable_ids': props.modelAble.ids,
        })
      }
    }
  }, 
  { deep: true, immediate: true })
</script>
