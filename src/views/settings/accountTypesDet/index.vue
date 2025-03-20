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
          @click="deleteAccountTypeDet"
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
        <VForm ref="form">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="AccountTypeForm.label"
                :label="$t('label')"
                :placeholder="$t('label')"
                :clearable="action === 'show'"
                :error-messages="errorMessages.label"
                :rules="[requiredValidator]"
                class="mt-2 required"
                :readonly="action === 'show'"
              />

              <AppCombobox
                v-model="AccountTypeForm.type"
                :label="$t('account_types')"
                class="mt-2 required"
                :placeholder="$t('account_types')"
                chips
                :items="types"
                item-title="label"
                item-value="id"
                :rules="[requiredValidator]"
                :return-object="false"
                :readonly="action === 'show'"
              />

              <AppCombobox
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
              <AppCombobox
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
        </VForm>
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
    :title="$t('account_types_det')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportAccountTypeDet"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importAccountTypesDet"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/account_types_det.xlsx"
    FileName="Exemplaire Types de compte Det.xlsx"
  />

  <VCard
    class=""
    :title="$t('account_types_det')"
    v-if="$can('account_type_dets.index')"
  >
    <template #append>
      <VBtn
        v-if="$can('account_type_dets.export')"
        class="me-2"
        color="primary"
        @click="exportData"
        :disabled="isDownloadingExport || !accountTypesDets.length"
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{
          isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export")
        }}
      </VBtn>
      <VBtn
        v-if="$can('account_type_dets.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportAccountTypeDet"
        class="me-2"
      >
        {{ $t("ImportMd.Import") }}
      </VBtn>
      <VBtn
        color="primary"
        @click="openModal('add')"
        v-if="$can('account_type_dets.store')"
      >
        {{ $t("add") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="accountTypesDets"
      :total="total"
      :per_page="10"
      :is-loading="isAccountTypesDetLoading"
      :filter="filters"
      @change-filter="changeFilter"
      :show-select="$can('account_type_dets.export')"
    >
      <template #item.label="{ item }">
        {{ item.label }}
      </template>
      <template #item.type="{ item }">
        {{ item.accountType?.label }}
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
            v-if="$can('account_type_dets.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="handleEditItem(item, true)"
          />
          <TooltipIcon
            v-if="$can('account_type_dets.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="handleEditItem(item)"
          />
          <TooltipIcon
            v-if="$can('account_type_dets.destroy')"
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
import { useAccountTypeDetStore, useCoreStore } from "@/stores";
import { useRouter } from "vue-router";

definePage({ meta: { navActiveLink: "settings-account-types" } });

const t = inject("t");

const coreStore = useCoreStore();

const router = useRouter();

const form = ref();
const selected = ref([]);
const { enums } = storeToRefs(coreStore);
const accountTypeDetStore = useAccountTypeDetStore();
const {
  accountTypesDets,
  isAccountTypesDetLoading,
  isDownloadingExport,
  isAccountTypeLoading,
  total,
  filters,
  isLoadingImportAccountTypeDet,
} = storeToRefs(accountTypeDetStore);
const fieldsData = ref({
  Libellé: "label",
  Statut: "is_active",
  Obligatoire: "is_required",
  Type: "account_type_id",
});
const requiredFieldsData = ref([
  "label",
  "is_active",
  "is_required",
  "account_type_id",
]);
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const selectedTypeDet = ref(null);
const isImportDialogVisible = ref(false);
const action = ref("");
const types = ref([]);
const AccountTypeForm = ref({
  label: "",
  is_active: "active",
  is_required: "oui",
  type: null,
});
const errorMessages = ref({
  label: null,
  type: null,
});
const showSnackbar = inject("showSnackbar");

const dialogTitle = computed(() => {
  return selectedTypeDet.value
    ? action.value == "edit"
      ? "update Account Type Det"
      : "show Account Type Det"
    : "New Account Type Det";
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
    title: t("type"),
    sortable: false,
    key: "type",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
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
  await accountTypeDetStore.getDTAccountTypesDets();

  const { data } = await useApi("accountTypes/active");
  types.value = data.value.data;
});

const exportData = async () => {
  await accountTypeDetStore.exportAccountTypesDets({ ids: selected.value });
};

async function importAccountTypesDet(payload) {
  isLoadingImportAccountTypeDet.value = true;
  const res = await accountTypeDetStore.importAccountTypesDet(payload);

  if (res) {
    isImportDialogVisible.value = false;
    showSnackbar(t("account_type_dets_import_success"), { color: "success" });
  } else {
    isImportDialogVisible.value = false;
    showSnackbar(t("Imported failed"), { color: "error" });
  }
  isLoadingImportAccountTypeDet.value = false;
}

function changeFilter(...obj) {
  accountTypeDetStore.getDTAccountTypesDets(...obj);
}

function handleEditItem(item, isShow = false) {
  // open modal with pre-filled data
  AccountTypeForm.value = {
    ...item,
    type: item.accountType?.id,
  };

  if (isShow) {
    return openModal("show", item);
  }

  openModal("edit", item);
}

function openModal(actionName, item = null) {
  action.value = actionName;
  selectedTypeDet.value = item;
  isDialogVisible.value = true;
}

function openDeleteModal(item) {
  selectedTypeDet.value = item;
  isDeleteDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  isDeleteDialogVisible.value = false;
  AccountTypeForm.value = {
    label: "",
    is_active: "active",
    is_required: "oui",
    type: null,
  };
  errorMessages.value = { label: null, type: null };
  action.value = "";
  selectedTypeDet.value = null;
}

async function SubmitEvent() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  let statusCode, data;

  if (action.value === "edit") {
    ({ statusCode, data } = await accountTypeDetStore.updateAccountTypesDet(
      selectedTypeDet.value.id,
      AccountTypeForm.value
    ));
  } else {
    ({ statusCode, data } = await accountTypeDetStore.addAccountTypesDet(
      AccountTypeForm.value,
      action.value !== "add"
    ));
  }

  if (statusCode == 201 || statusCode == 200) {
    accountTypeDetStore.getDTAccountTypesDets();
    showSnackbar(statusCode === 201 ? t("Type Compte Det créé avec succès.") : t("Type Compte Det modifiée avec succès."), { color: "success" });
    closeModal();
  } else {
    showSnackbar(t("error") + data?.message ?? t("try again in a few seconds"), {
      color: "error",
    });
  }

  onBeforeUnmount(async () => {
    await accountTypeDetStore.reset("accountTypesDets");
  });
}

async function deleteAccountTypeDet() {
  const { statusCode, data } = await accountTypeDetStore.deleteAccountTypesDet(
    selectedTypeDet.value.id
  );

  if (statusCode == 204) {
    closeModal();
    showSnackbar(t("Deleted ok"), { color: "success" });
    accountTypeDetStore.getDTAccountTypesDets();
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
