<template>
  <VCardText>
    <VForm ref="itemForm">
      <VRow>
        <VCol cols="12">
          <VFileInput
            v-model="form.file"
            :placeholder="$t('Upload attachments.File')"
            :label="$t('Upload attachments.File')"
            prepend-icon="tabler-paperclip"
            show-size
            :rules="[requiredValidator]"
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
    form.value.file = form.value.file[0]
    emits('onUpload', form.value)
    itemForm.value?.reset()
  })
}
</script>
