<template>
  <ConfirmDeleteDialog
    :is-dialog-visible="isDialogDeleteVisible"
    @close="closeModalDelete"
    @on-delete="deleteCompanyGroup"
    :isLoading="isLoadingDeleteCompanyGroup[rememberId]"
  />

  <ImportDialog
    :title="$t('company_groups.company_group')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportCompanyGroups"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importCompanyGroups"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/company_groups.xlsx"
    FileName="Exemplaire Groupes de sociétés.xlsx"
  />

  <insertCompanyGroup
    v-model:is-insert-company-group-dialog-shown="isInsertCompanyGroupDialogShown"
    v-model:readOnlyMode="showCompanyGroupInReadOnlyMode"
    v-model:data="currentCompanyGroup"
    @update:is-insert-company-group-dialog-shown="isInsertCompanyGroupDialogShown = $event"
    @update:show-company-group-in-read-only-mode="showCompanyGroupInReadOnlyMode = $event"
  />

  <VCard :title="$t('Company_groups')" v-if="$can('company_groups.index')">
    <template #append>
      <VBtn
        v-if="$can('company_groups.export')" 
        color="primary"
        @click="exportExcel"
        :disabled="!companyGroups.length || isCompanyGroupLoading || isExportingCompanyGroup"
        :loading="isExportingCompanyGroup"
        class="me-2"
      >
        {{ $t("ImportMd.Export") }}
      </VBtn>
      <!-- <VBtn
        v-if="$can('company_groups.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportCompanyGroups"
        :disabled="isLoadingImportCompanyGroups || isExportingCompanyGroup"
        class="me-2"
      >
        {{ $t('ImportMd.Import') }}
      </VBtn> -->
      <VBtn 
        v-if="$can('company_groups.store')" 
        color="primary" 
        @click="openModal()"
        :disabled="isExportingCompanyGroup"
      >
        {{ $t("Add") }}
      </VBtn>
      
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="companyGroups"
      :total="total"
      :per_page="10"
      :is-loading="isCompanyGroupLoading"
      :filter="filter"
      @change-filter="changeFilter"
      :show-select="$can('company_groups.export')"
      :page="page"
    >
       <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
        </template>
     <template #item.company="{ item }">
         <VChip
          v-for="(comp, index) in item.company.slice(0, 2)"
          :key="comp.id"
          color="primary"
          class="me-1"
        >
          <span>
            {{ comp.label }}
          </span>
        </VChip>
        <VChip v-if="item.company.length > 2" color="primary" class="ml-1" >...</VChip> 
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('company_groups.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="openModal(item,true)"  
          />
          <TooltipIcon
            v-if="$can('company_groups.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="openModal(item)"
          />
          <template v-if="!isLoadingDeleteCompanyGroup[item.id]">
            <TooltipIcon
              v-if="$can('company_groups.destroy')"
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
import insertCompanyGroup from "@/views/settings/companyGroups/insertCompanyGroup.vue"
import { useCompanyGroup } from "@/composables/companyGroup.js";
import { onMounted } from "vue";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const {
  isDialogDeleteVisible,
  isLoadingDeleteCompanyGroup,
  rememberId,
  companyGroupStore,
  isCompanyGroupLoading,
  companyGroups,
  currentCompanyGroup,
  total,
  filter,
  requiredFieldsData,
  fieldsData,
  headers,
  selected,
  enums,
  isInsertCompanyGroupDialogShown,
  showCompanyGroupInReadOnlyMode,
  isImportDialogVisible,
  isLoadingImportCompanyGroups,
  isExportingCompanyGroup,
  openModal,
  deleteCompanyGroup,
  openModalDelete,
  changeFilter,
  resetRememberId,
  closeModalDelete,
  importCompanyGroups,
  exportExcel,
  getData
} = useCompanyGroup(t, showSnackbar)

onMounted(async() => {
  await getData()
})
</script>
