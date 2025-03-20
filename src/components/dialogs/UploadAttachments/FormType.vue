<template>
  <VCardText>
    <VForm ref="itemForm">
      <VRow v-if="!types.length">
        <VCol cols="12">
          <VAlert
            color="warning"
            style=" padding-block: 9px 9px;"
          >
            {{ $t('Upload attachments.Warning msg') }} 
          </VAlert>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12">
          <AppCombobox
            v-model="form.selectedType"
            :items="types"
            item-title="name"
            item-value="id"
            :label="$t('Upload attachments.File type')"
            :placeholder="$t('Upload attachments.File type')"
            :rules="[requiredValidator]"
            :disabled="!types.length"
          />
        </VCol>
        <VCol cols="12">
          <VFileInput
            v-model="form.file"
            :placeholder="$t('Upload attachments.File')"
            :label="$t('Upload attachments.File')"
            prepend-icon="tabler-paperclip"
            show-size
            :rules="[requiredValidator]"
            :disabled="!types.length"
          >
            <template #selection="{ fileNames }">
              <template
                v-for="fileName in fileNames"
                :key="fileName"
              >
                <VChip
                  label
                  size="small"
                  color="primary"
                  class="me-2"
                >
                  {{ fileName }}
                </VChip>
              </template>
            </template>
          </VFileInput>
        </VCol>
      </VRow>
    </VForm>
  </VCardText>
  <VCardText class="d-flex justify-end">
    <VBtn
      :disabled="isUploading"
      @click="upload"
    >
      {{ $t('Upload attachments.Upload') }}
      <VProgressCircular
        v-if="isUploading"
        indeterminate
        color="secondary"
        :size="20"
        width="3"
        class="ml-2"
      />
    </VBtn>
  </VCardText>
</template>

<script setup>
import { useAttachmentStore } from "@/stores"
import { delay } from "lodash"

const props = defineProps({
  types: {
    type: Array,
  },
  isDialogVisible: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['onUpload'])
const attachmentStore = useAttachmentStore()
const { isUploading } = storeToRefs(attachmentStore)
const form = ref({})
const itemForm = ref(null)

watch(() => props.isDialogVisible,
  () => {
    if(!props.isDialogVisible){
      delay(() => {
        itemForm.value?.reset()
      }, 200)
    }
  })

function upload(){
  itemForm.value.validate().then(async ({ valid }) => {
    if (!valid) return
    form.value.label = form.value.selectedType.label
    form.value.attachment_type_id = form.value.selectedType.id
    form.value.file = form.value.file[0]
    emits('onUpload', form.value)
    itemForm.value?.reset()
  })
}
</script>
