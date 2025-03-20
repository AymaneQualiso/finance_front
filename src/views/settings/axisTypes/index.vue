<template>
  <ConfirmDeleteDialog
    :is-dialog-visible="isDialogDeleteVisible"
    @close="closeModalDelete"
    @on-delete="deleteAxisType"
    :isLoading="isLoadingDeleteAxisType[rememberId]"
  />

  <ImportDialog
    :title="$t('axis_types.axis_type')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportAxisType"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importAxisTypes"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/axis_types.xlsx"
    FileName="Exemplaire Types d'axes.xlsx"
  />

  <insertAxisType
    v-model:is-insert-axis-type-dialog-shown="isInsertAxisTypeDialogShown"
    v-model:readOnlyMode="showAxisTypeInReadOnlyMode"
    v-model:data="currentAxisType"
    @update:is-insert-axis-type-dialog-shown="
      isInsertAxisTypeDialogShown = $event
    "
    @update:show-axis-type-in-read-only-mode="
      showAxisTypeInReadOnlyMode = $event
    "
  />

  <VCard :title="$t('Axis_types')" v-if="$can('axis_types.index')">
    <template #append>
      <VBtn
        v-if="$can('axis_types.export')"
        color="primary"
        @click="exportExcel"
        :disabled="
          !axisTypes.length || isLoadingAxisType || isExportingAxisType
        "
        :loading="isExportingAxisType"
        class="me-2"
      >
        {{ $t("ImportMd.Export") }}
      </VBtn>
      <!-- <VBtn
        v-if="$can('axis_types.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportAxisType"
        :disabled="isLoadingImportAxisType || isExportingAxisType"
        class="me-2"
      >
        {{ $t("ImportMd.Import") }}
      </VBtn> -->
       <VBtn
        v-if="$can('axis_types.store')"
        color="primary"
        @click="openModal()"
        :disabled="isExportingAxisType"
      >
        {{ $t("Add") }}
      </VBtn> 
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="axisTypes"
      :total="total"
      :per_page="10"
      :is-loading="isLoadingAxisType"
      :filter="filter"
      @change-filter="changeFilter"
      :show-select="$can('axis_types.export')"
      :page="page"
    >
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.is_required="{ item }">
        <StatusChip :title="item.is_required" />
      </template>
     <template #item.company_id="{ item }">
  {{ companies.find(company => company.id === item.company_id)?.label || 'Unknown' }}
</template>

      


      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('axis_types.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="openModal(item, true)"
          />
          <TooltipIcon
            v-if="$can('axis_types.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="openModal(item)"
          />
          <!-- <template v-if="!isLoadingDeleteAxisType[item.id]">
            <TooltipIcon
              v-if="$can('axis_types.destroy')"
              :tooltip-text="$t('delete')"
              icon="tabler-trash"
              color="error"
              @click="openModalDelete(item)"
            />
          </template> -->
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import insertAxisType from "@/views/settings/axisTypes/InsertAxisType.vue";
import { useAxisType } from "@/composables/axisType.js";
import { useCompanyStore } from "@/stores";

import { onMounted } from "vue";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const companyStore = useCompanyStore();

const { companies } = storeToRefs(companyStore);

const {
  isDialogDeleteVisible,
  isLoadingDeleteAxisType,
  rememberId,
  axisTypeStore,
  isLoadingAxisType,
  axisTypes,
  currentAxisType,
  total,
  filter,
  requiredFieldsData,
  fieldsData,
  headers,
  selected,
  isInsertAxisTypeDialogShown,
  showAxisTypeInReadOnlyMode,
  isImportDialogVisible,
  isLoadingImportAxisType,
  isExportingAxisType,
  openModal,
  deleteAxisType,
  openModalDelete,
  changeFilter,
  resetRememberId,
  closeModalDelete,
  importAxisTypes,
  // getValueIsRequired,
  exportExcel,
  getData,
} = useAxisType(t, showSnackbar);

onMounted(async () => {
    await companyStore.getOnlyActiveCompanies();

  await getData();
});
</script>
