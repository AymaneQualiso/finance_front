<template>
  <VDialog v-model="isDeleteDialogVisible" persistent max-width="600">
    <DialogCloseBtn :disabled="isAccountTypeLoading" @click="closeModal" />
    <VCard
      title="Confirmer"
      :loading="isAccountTypeLoading"
      :disabled="isAccountTypeLoading"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            {{ $t("Deleting msg") }}
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="closeModal"
          :disabled="isAccountTypeLoading"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          @click="deleteAccountType"
          :disabled="isAccountTypeLoading"
          :loading="isAccountTypeLoading"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isAccountTypeLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t(dialogTitle)"
      :loading="isAccountTypeLoading"
      :disabled="isAccountTypeLoading"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="AccountTypeForm.label"
              :label="$t('label')"
              :placeholder="$t('label')"
              :clearable="action != 'show'"
              @input="errorMessages.label = null"
              :error-messages="errorMessages.label"
              class="mt-2 required"
              :readonly="action === 'show'"
            />
          </VCol>
 <VCol cols="12">
            <VSelect
              v-model="AccountTypeForm.is_active"
              :label="$t('is_active')"
              :placeholder="$t('is_active')"
              :items="getEnums(enums.isActive, $t)"
              item-title="title"
              item-value="key"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
            />
 </VCol>
  <VCol cols="12">
            <VSelect
              v-model="AccountTypeForm.is_required"
              :label="$t('is_required')"
              :placeholder="$t('is_required')"
              :items="getEnums(enums.isRequired, $t)"
              item-title="title"
              item-value="key"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ t("Cancel") }}
        </VBtn>
        <VBtn @click="SubmitEvent" v-if="action !== 'show'">
          {{ t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <ImportDialog
    :title="$t('account_types')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportAccountType"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importAccountTypes"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/account_types.xlsx"
    FileName="Exemplaire Types de compte.xlsx"
  />

  <VCard
    class=""
    :title="$t('account_types')"
    v-if="$can('account_types.index')"
  >
    <template #append>
      <VBtn
        v-if="$can('account_types.export')"
        class="me-2"
        color="primary"
        @click="exportData"
        :disabled="isDownloadingExport || !accountTypes.length"
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{
          isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export")
        }}
      </VBtn>
      <VBtn
        v-if="$can('account_types.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportAccountType"
        class="me-2"
      >
        {{ $t("ImportMd.Import") }}
      </VBtn>
      <VBtn
        color="primary"
        @click="openModal('add')"
        v-if="$can('account_types.store')"
      >
        {{ $t("add") }}
      </VBtn>
    </template>

    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="accountTypes"
      :total="total"
      :per_page="10"
      :is-loading="isAccountTypesLoading"
      :filter="filters"
      @change-filter="changeFilter"
      :show-select="$can('account_types.export')"
    >
      <template #item.label="{ item }">
        {{ item.label }}
      </template>
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.is_required="{ item }">
        <StatusChip :title="item.is_required" />
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('account_types.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="handleEditItem(item, true)"
          />
          <TooltipIcon
            v-if="$can('account_types.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="handleEditItem(item)"
          />
          <TooltipIcon
            v-if="$can('account_types.destroy')"
            :tooltip-text="$t('SetUSerMd.delete')"
            icon="tabler-trash"
            color="error"
            @click="openDeleteModal(item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useApi } from "@/composables/useApi";
import { useAccountTypeStore, useCoreStore } from "@/stores";
import { useRouter } from "vue-router";

definePage({ meta: { navActiveLink: "settings-account-types" } });

const t = inject("t");

const coreStore = useCoreStore();

const router = useRouter();
const selected = ref([]);
const { enums } = storeToRefs(coreStore);
const accountTypeStore = useAccountTypeStore();
const {
  accountTypes,
  isAccountTypesLoading,
  isDownloadingExport,
  isAccountTypeLoading,
  total,
  filters,
  isLoadingImportAccountType,
} = storeToRefs(accountTypeStore);
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isImportDialogVisible = ref(false);
const selectedType = ref(null);
const action = ref("");
const AccountTypeForm = ref({
  label: "",
  is_active: "active",
  is_required: "oui",
});
const fieldsData = ref({
  Libellé: "label",
  Status: "is_active",
  Obligatoire: "is_required",
});
const requiredFieldsData = ref(["label", "is_active", "is_required"]);
const errorMessages = ref({
  label: null,
});
const showSnackbar = inject("showSnackbar");

const dialogTitle = computed(() => {
  return selectedType.value
    ? action.value == "edit"
      ? "Update Account Type"
      : "show Account Type"
    : "New Account Type";
});

const headers = ref([
  {
    title: t("label"),
    sortable: true,
    key: "label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Status"),
    sortable: true,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  {
    title: t("is_required"),
    sortable: true,
    key: "is_required",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isRequired, t),
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

onMounted(async () => {
  await accountTypeStore.getDTaccountTypes();
});

const exportData = async () => {
  await accountTypeStore.exportAccountTypes({ ids: selected.value });
};

async function importAccountTypes(payload) {
  isLoadingImportAccountType.value = true;
  const res = await accountTypeStore.importAccountTypes(payload);

  if (res) {
    isImportDialogVisible.value = false;
    showSnackbar(t("account_type_import_success"), { color: "success" });
  } else {
    isImportDialogVisible.value = false;
    showSnackbar(t("Imported failed"), { color: "error" });
  }
  isLoadingImportAccountType.value = false;
}

function changeFilter(...obj) {
  accountTypeStore.getDTaccountTypes(...obj);
}

function handleEditItem(item, isShow = false) {
  // open modal with pre-filled data
  AccountTypeForm.value = { ...item };
  if (isShow) {
    return openModal("show", item);
  }
  openModal("edit", item);
}

function openModal(actionName, item = null) {
  action.value = actionName;
  selectedType.value = item;
  isDialogVisible.value = true;
}

function openDeleteModal(item) {
  selectedType.value = item;
  isDeleteDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  isDeleteDialogVisible.value = false;
  AccountTypeForm.value = {
    label: "",
    is_active: "active",
    is_required: "oui",
  };
  errorMessages.value = { label: null, is_active: null };
  action.value = "";
  selectedType.value = null;
}

async function SubmitEvent() {
  if (!AccountTypeForm.value.label) {
    errorMessages.value.label = t("field_required");
    return;
  }
  let statusCode, data;
  if (action.value === "edit") {
    ({ statusCode, data } = await accountTypeStore.updateAccountType(
      selectedType.value.id,
      AccountTypeForm.value
    ));
  } else {
    ({ statusCode, data } = await accountTypeStore.addAccountType(
      AccountTypeForm.value,
      action.value !== "add"
    ));
  }

  if (statusCode == 201 || statusCode == 200) {
    accountTypeStore.getDTaccountTypes();
    showSnackbar(statusCode == 201 ? t("Type créé avec succès.") : t("Type modifiée avec succès."), { color: "success" });
    closeModal();
  } else {
    showSnackbar(t("error") + data?.message ?? t("try again in a few seconds"), {
      color: "error",
    });
  }

  onBeforeUnmount(async () => {
    await accountTypeStore.reset("accountTypes");
  });
}

async function deleteAccountType() {
  const { statusCode, data } = await accountTypeStore.deleteAccountType(
    selectedType.value.id
  );

  if (statusCode == 204) {
    closeModal();
    showSnackbar(t("Deleted ok"), { color: "success" });
    accountTypeStore.getDTaccountTypes();
  } else if (statusCode == 403) {
    closeModal();
    showSnackbar(t(data.message), { color: "error" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }
}
</script>

<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
