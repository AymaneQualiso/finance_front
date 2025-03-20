<template>
  <ConfirmDeleteDialog
    :is-dialog-visible="isDialogDeleteVisible"
    @close="closeModalDelete"
    @on-delete="deleteAnalyticalAxie"
    :isLoading="isLoadingDeleteAnalyticalAxie[rememberId]"
  />

  <ImportDialog
    :title="$t('analytical_axies.analytical_axie')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportAnalyticalAxie"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importAnalyticalAxies"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/analytical_axies.xlsx"
    FileName="Exemplaire Axes analytiques.xlsx"
  />

  <insertAnalyticalAxies
    v-model:is-insert-analytical-axies-dialog-shown="isInsertAnalyticalAxiesDialogShown"
    v-model:readOnlyMode="showAnalyticalAxiesInReadOnlyMode"
    v-model:data="currentAnalyticalAxies"
    @update:is-insert-axis-type-dialog-shown="isInsertAnalyticalAxiesDialogShown = $event"
    @update:show-axis-type-in-read-only-mode="showAnalyticalAxiesInReadOnlyMode = $event"
  />

  <VCard :title="$t('Analytical_axies')" v-if="$can('analytical_axies.index')">
    <template #append>
      <VBtn
        v-if="$can('analytical_axies.export')" 
        color="primary"
        @click="exportExcel"
        :disabled="!AnalyticalAxies.length || isLoadingAnalyticalAxies || isExportingAnalyticalAxies"
        :loading="isExportingAnalyticalAxies"
        class="me-2"
      >
        {{ $t("ImportMd.Export") }}
      </VBtn>
      <VBtn
        v-if="$can('analytical_axies.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportAnalyticalAxie"
        :disabled="isLoadingImportAnalyticalAxie || isExportingAnalyticalAxies"
        class="me-2"
      >
        {{ $t('ImportMd.Import') }}
      </VBtn>
      <VBtn 
        v-if="$can('analytical_axies.store')" 
        color="primary" 
        @click="openModal()"
        :disabled="isExportingAnalyticalAxies"
      >
        {{ $t("Add") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="AnalyticalAxies"
      :total="total"
      :per_page="10"
      :is-loading="isLoadingAnalyticalAxies"
      :filter="filter"
      @change-filter="changeFilter"
      :show-select="$can('analytical_axies.export')"
      :page="page"
    >
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('analytical_axies.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="openModal(item,true)"
          />
          <TooltipIcon
            v-if="$can('analytical_axies.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="openModal(item)"
          />
          <template v-if="!isLoadingDeleteAnalyticalAxie[item.id]">
            <TooltipIcon
              v-if="$can('analytical_axies.destroy')"
              :tooltip-text="$t('delete')"
              icon="tabler-trash"
              color="error"
              @click="openModalDelete(item)"
            />
          </template>
          <template v-else>
            <v-progress-circular
              indeterminate
              color="error"
              size="24"
            ></v-progress-circular>
          </template>
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>
<script setup>
import { useAnalyticalAxies } from "@/composables/analyticalAxies.js";
import insertAnalyticalAxies from "@/views/settings/analyticalAxies/insertAnalyticalAxies.vue"

const showSnackbar = inject("showSnackbar");
const t = inject("t");

const {
  headers,
  filter,
  total,
  AnalyticalAxies,
  currentAnalyticalAxies,
  isLoadingAnalyticalAxies,
  rememberId,
  fieldsData,
  selected,
  requiredFieldsData,
  isInsertAnalyticalAxiesDialogShown,
  showAnalyticalAxiesInReadOnlyMode,
  isLoadingDeleteAnalyticalAxie,
  isLoadingImportAnalyticalAxie,
  isExportingAnalyticalAxies,
  isImportDialogVisible,
  isDialogDeleteVisible,
  importAnalyticalAxies,
  deleteAnalyticalAxie,
  closeModalDelete,
  openModalDelete,
  changeFilter,
  exportExcel,
  openModal,
  getData
} = useAnalyticalAxies(t, showSnackbar)

onMounted(async() => {
  await getData()
})
</script>
