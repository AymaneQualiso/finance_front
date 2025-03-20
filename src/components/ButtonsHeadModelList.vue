<template>
  <BtnSendExcelByMail
    v-if="$can(model + '.export')"
    :is-loading="isSending"
    @send-mails="sendExcelToMails"
  />
  <BtnExportExcel
    v-if="$can(model + '.export')"
    :is-loading="isExporting"
    @export="exportPlanInvent"
  />
  <VBtn
    v-if="withAddBtn && $can(model + '.store')"
    color="primary"
    class="ms-4"
    @click="redirectToForm"
  >
    {{ $t('Add') }}
  </VBtn>
</template>

<script setup>
import BtnExportExcel from "@/components/BtnExportExcel.vue"
import BtnSendExcelByMail from "@/components/BtnSendExcelByMail.vue"

const props = defineProps({
  isSending: {
    type: Boolean,
    default: false,
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
  withAddBtn: {
    type: Boolean,
    default: true,
  },
  model: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['onSendExcelToMails', 'onExportExcel', 'onRedirect'])

function sendExcelToMails(selectedMails){
  emits('onSendExcelToMails', selectedMails)
}

function exportPlanInvent(format){
  emits('onExportExcel', format)
}

function redirectToForm(){
  emits('onRedirect')
}
</script>
