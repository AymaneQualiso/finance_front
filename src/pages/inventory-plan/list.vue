<template>
  <ConfirmDeleteDialog 
    :is-dialog-visible="isDeleteDialogVisible" 
    @close="isDeleteDialogVisible = !isDeleteDialogVisible" 
    @on-delete="deleteInventoryPlan"
  />

  <UploadAttachments 
    :is-visible="showModalAttachments" 
    :model-able="modelAble"
    model="inventory_plans"
    :with-form="selectedItem?.status !== enums.inventoryStatus.CLOSED && selectedItem?.can_edit"
    @close="closeModalAttachments"
    @upload-file="uploadAttachment"
    @on-delete="deleteAttachment"
    @on-download="downloadAttachment"
  />
  
  <VCard
    v-if="$can('inventory_plans.index')"
    :title="$t('InvPlanMd.Inventory Plan')"
  >
    <template #append>
      <ButtonsHeadModelList 
        :is-sending="isSending"
        :is-exporting="isExporting"
        model="inventory_plans"
        @on-send-excel-to-mails="sendExcelToMails"
        @on-export-excel="exportPlanInvent"
        @on-redirect="redirectToForm({}, 'add', {src: $route.path})"
      />
    </template>
  
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="inventoryPlans"
      :total="total"
      :per_page="10"
      :is-loading="isLoading"
      :filter="filter"
      :show-select="$can('inventory_plans.export')"
      @change-filter="changeFilter"
    >
      <template #item.name="{ item }">
        <span
          class="link-style"
          @click="redirectToForm(item, 'show')"
        >
          {{ item.name }}
        </span>
      </template>
      <template #item.reference="{ item }">
        <span
          class="link-style"
          @click="redirectToForm(item, 'show')"
        >
          {{ item.reference }}
        </span>
      </template>
      <template #item.start_at="{ item }">
        {{ formatDate(item.start_at) }}
      </template>
      <template #item.end_at="{ item }">
        {{ formatDate(item.end_at) }}
      </template>
      <template #item.status="{ item }">
        <StatusChip :title="item.status" />
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('inventory_plans.show')"
            :tooltip-text="$t('InvPlanMd.show')"
            icon="tabler-eye"
            color="primary"
            @click="redirectToForm(item, 'show')"
          />
          
          <TooltipIcon
            v-if="$can('inventory_plans.attachments_index')"
            :tooltip-text="$t('InvPlanMd.attachments')"
            icon="tabler-file-upload"
            color="warning"
            @click="openModalAttachments(item.id); selectedItem = item"
          />
          
          <TooltipIcon
            v-if="$can('inventory_plans.update')"
            :is-not-allowed="item.status === enums?.inventoryStatus.CLOSED || !item.can_edit"
            :tooltip-text="$t('InvPlanMd.edit')"
            icon="tabler-edit"
            color="primary"
            @click="redirectToForm(item, 'edit', {src: $route.path})"
          />
          
          <TooltipIcon
            v-if="$can('inventory_plans.destroy')"
            :is-not-allowed="!item.can_edit"
            :tooltip-text="$t('InvPlanMd.delete')"
            icon="tabler-trash"
            color="error"
            @click="openConfirmationModal(item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useInventoryPlan } from "@/composables/inventoryPlan"


const t = inject("t")
const showSnackbar = inject('showSnackbar')
const selectedItem = ref(null)

  
const {
  headers,
  isDeleteDialogVisible,
  modelAble,
  showModalAttachments,
  isSending,
  isExporting,
  selected,
  inventoryPlans,
  total,
  isLoading,
  filter,
  storeInventoryPlans,
  getData,
  changeFilter,
  exportPlanInvent,
  redirectToForm,
  sendExcelToMails,
  deleteInventoryPlan,
  closeModalAttachments,
  openModalAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  openConfirmationModal,
  enums,
} = useInventoryPlan(t, showSnackbar)

onMounted(() => {
  getData()
  inventoryPlans.value = []
  storeInventoryPlans.getInventoryPlans()
})
</script>
  