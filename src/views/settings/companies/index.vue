<template>
  <ConfirmDeleteDialog
    :is-dialog-visible="isDialogVisible"
    @close="isDialogVisible = !isDialogVisible"
    @on-delete="deleteCompany"
    :isLoading="isLoadingDeleteCompany[rememberId]"
  />

  <VCard :title="$t('Companies')" v-if="$can('companies.index')">
    <template #append>
      <VBtn
        v-if="$can('companies.export')" 
        color="primary"
        @click="exportExcel"
        :disabled="!companies.length || isCompaniesLoading || isExportingCompanies"
        :loading="isExportingCompanies"
        class="me-2"
      >
        {{ $t("ImportMd.Export") }}
      </VBtn>
      <VBtn 
        v-if="$can('companies.store')" 
        color="primary" 
        @click="redirectToForm('companies', 'create',item , null)"
        :disabled="isExportingCompanies"
      >
        {{ $t("Add") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="companies"
      :total="total"
      :per_page="10"
      :is-loading="isCompaniesLoading"
      :filter="filters"
      @change-filter="changeFilter"
      :show-select="$can('companies.export')"
      :page="page"
    >
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('companies.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="redirectToForm('companies', 'show',item , null)"
          />
          <TooltipIcon
            v-if="$can('companies.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="redirectToForm('companies', 'update',item , null)"
          />
          <template v-if="!isLoadingDeleteCompany[item.id]">
            <TooltipIcon
              v-if="$can('companies.destroy')"
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
      <template #item.users="{ item }">
        <div class="d-flex justify-start gap-3">
          <VChip
            v-for="(user, index) in item?.users?.slice(0, 3)"
            :key="user"
            color="primary"
          >
            <span>
              {{ user.name }}
            </span>
          </VChip>
          <VChip v-if="item?.users?.length > 3" color="primary" class="ml-2"
            >...</VChip
          >
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useCompanyStore, useCoreStore, useUserStore } from "@/stores";
import { useCompany } from "@/composables/company.js";
import { isEmpty } from "@/@core/utils/helpers";

const userStore = useUserStore();
const companyStore = useCompanyStore();
const { companies, isCompaniesLoading, total, page, filters, company } =
  storeToRefs(companyStore);
const t = inject("t");
// const isDialogAddVisible = ref(false);
const showSnackbar = inject("showSnackbar");
const errors = ref();

const {
  coreStore,
  enums,
  rememberId,
  selected,
  users,
  headers,
  isExportingCompanies,
  isLoadingDeleteCompany,
  isDialogVisible,
  redirectToForm,
  openModalDelete,
  closeModalDelete,
  deleteCompany,
  changeFilter,
  exportExcel
} = useCompany(t, showSnackbar)

onMounted(() => {
  companyStore.getDTCompanies();
  getAllUsers();
});

onBeforeUnmount(async () => {
  companyStore.reset("companies");
});

async function getAllUsers() {
  const data = await userStore.getAllUsers();
  users.value = data;
}
</script>
