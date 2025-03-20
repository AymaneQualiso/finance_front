<template>
  <VCard
    v-if="items.length"
    :title="items[currentStep].file_name"
  >
    <div class="d-flex align-center justify-center px-6 py-6">
      <VImg
        :width="500"
        :height="500"
        aspect-ratio="1/1"
        cover
        :src="url"
      >
        <template #placeholder>
          <div
            v-if="isGettingUrl"
            class="d-flex align-center justify-center fill-height"
          >
            <VProgressCircular
              color="grey-lighten-4"
              indeterminate
            />
          </div>
        </template>
      </VImg>
    </div>
    <div class="d-flex align-center justify-center gap-4 pb-6">
      <VBtn
        size="small"
        icon="tabler-arrow-big-left-filled"
        rounded
        :disabled="isGettingUrl || currentStep == 0"
        @click="onPrec"
      />
      <VBtn
        size="small"
        icon="tabler-arrow-big-right-filled"
        rounded
        :disabled="isGettingUrl || currentStep == items.length-1"
        @click="onNext"
      />
    </div>
  </VCard>
</template>

<script setup>
import { useAttachmentStore } from "@/stores"
import { watch } from "vue"

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
})

const emits = defineEmits(['close'])

const attachmentStore = useAttachmentStore()
const { isGettingUrl } = storeToRefs(attachmentStore)
const currentStep = ref(props.index)
const url = ref('')

watch(() => currentStep.value,
  async () => {
    url.value = ''
    url.value = await attachmentStore.getAttachmentUrl(props.items[currentStep.value])
  }, { immediate: true })

function onNext(){
  currentStep.value += 1
}

function onPrec(){
  currentStep.value -= 1
}
</script>
