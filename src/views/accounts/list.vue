<template>
  <ConfirmDeleteDialog
    :is-dialog-visible="isDialogDeleteVisible"
    @close="closeModalDelete"
    @on-delete="deleteAccount"
    :isLoading="isLoadingDeleteAccount[rememberId]"
  />

  <ImportDialog
    :title="$t('accounts.account')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportAccounts"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importAccounts"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/accounts.xlsx"
    FileName="Exemplaire Comptes.xlsx"
  />

  <insertAccount
    v-model:is-insert-accounts-dialog-shown="isInsertAccountsDialogShown"
    v-model:readOnlyMode="showAccountsInReadOnlyMode"
    v-model:data="currentAccount"
    @update:is-insert-axis-type-dialog-shown="isInsertAccountsDialogShown = $event"
    @update:show-accounts-in-read-only-mode="showAccountsInReadOnlyMode = $event"
  />

  <VCard :title="$t('Accounts')" v-if="$can('accounts.index')">
    <template #append>
      <VBtn
        v-if="$can('accounts.export')" 
        color="primary"
        @click="exportExcel"
        :disabled="!accounts.length || isLoadingAccounts || isExportingAccounts"
        :loading="isExportingAccounts"
        class="me-2"
      >
        {{ $t("ImportMd.Export") }}
      </VBtn>
      <VBtn
        v-if="$can('accounts.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportAccounts"
        :disabled="isLoadingImportAccounts || isLoadingAccounts"
        class="me-2"
      >
        {{ $t('ImportMd.Import') }}
      </VBtn>
      <VBtn 
        v-if="$can('accounts.store')" 
        color="primary" 
        @click="openModal()"
      >
        {{ $t("Add") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="isLoadingGetData ? [] : accounts"
      :total="total"
      :per_page="10"
      :is-loading="isLoadingAccounts||isLoadingGetData"
      :filter="filter"
      @change-filter="changeFilter"
      :show-select="$can('accounts.export')"
      :page="page"
    >
      <template #item.label="{ item }">
        <VTooltip>
          <template #activator="{ props }">
            <span v-bind="props" class="truncate" :title="item.label">
              {{ item.label }}
            </span>
          </template>
          <span>{{ item.label }}</span>
        </VTooltip>
      </template>
      <template #item.label_2="{ item }">
        <VTooltip>
          <template #activator="{ props }">
            <span v-bind="props" class="truncate" :title="item.label_2">
              {{ item.label_2 }}
            </span>
          </template>
          <span>{{ item.label_2 }}</span>
        </VTooltip>
      </template>
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('accounts.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="openModal(item,true)"
          />
          <TooltipIcon
            v-if="$can('accounts.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="openModal(item)"
          />
          <template v-if="!isLoadingDeleteAccount[item.id]">
            <TooltipIcon
              v-if="$can('accounts.destroy')"
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
import { useAccounts } from "@/composables/account.js";
import insertAccount from "@/views/accounts/insertAccount.vue"

const showSnackbar = inject("showSnackbar");
const t = inject("t");

const {
  headers,
  filter,
  total,
  selected,
  accounts,
  currentAccount,
  isLoadingAccounts,
  rememberId,
  fieldsData,
  requiredFieldsData,
  isInsertAccountsDialogShown,
  showAccountsInReadOnlyMode,
  isLoadingDeleteAccount,
  isLoadingImportAccounts,
  isExportingAccounts,
  isImportDialogVisible,
  isDialogDeleteVisible,
  isLoadingGetData,
  importAccounts,
  deleteAccount,
  closeModalDelete,
  openModalDelete,
  changeFilter,
  exportExcel,
  openModal,
  getData
} = useAccounts(t, showSnackbar)

onMounted(async() => {
  await Promise.all([
    await getData()
  ]).then(() => {
    isLoadingGetData.value = false;
  })
  .catch(() => {
    isLoadingGetData.value = false;
  });
})
</script>
