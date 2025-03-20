<template>
  <VDialog v-model="isDeleteDialogVisible" persistent max-width="600">
    <DialogCloseBtn :disabled="isImportModelLoading" @click="closeModal" />
    <VCard
      title="Confirmer"
      :loading="isImportModelLoading"
      :disabled="isImportModelLoading"
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
          :disabled="isImportModelLoading"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          @click="deleteAccountType"
          :disabled="isImportModelLoading"
          :loading="isImportModelLoading"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isImportModelLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t(dialogTitle)"
      :loading="isImportModelLoading"
      :disabled="isImportModelLoading"
    >
      <VCardText>
        <VForm ref="form">
        <VRow>
          <VCol cols="12">
            <VSwitch
              v-if="action !== 'add'"
              v-model="shouldFileBeChanged"
              :label="$t('Change file')"
              class="my-2"
              :readonly="action === 'show'"
            />
            <VFileInput
              v-if="shouldFileBeChanged || action === 'add'"
              v-model="importModelForm.file"
              :placeholder="$t('ImportMd.Import file')"
              :label="$t('ImportMd.Import file')"
              prepend-icon="tabler-paperclip"
              show-size
              :rules="[requiredValidator]"
            >
              <template #selection="{ fileNames }">
                <template v-for="fileName in fileNames" :key="fileName">
                  <VChip label size="small" color="primary" class="me-2">
                    {{ fileName }}
                  </VChip>
                </template>
              </template>
            </VFileInput>

            <AppCombobox
              v-model="importModelForm.module"
              :label="$t('module')"
              :placeholder="$t('module')"
              :items="getModules(settingsModules)"
              item-title="name"
              item-value="id"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
            />
            <AppCombobox
              v-if="
                settingsModules.find(
                  (module) => module.id === importModelForm.module
                )?.name == 'balances'
              "
              v-model="importModelForm.import_type_balance"
              :label="$t('type')"
              :placeholder="$t('type')"
              :items="getEnums(enums.importFileTypeBalance, $t)"
              item-title="title"
              item-value="key"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
            />
            <AppCombobox
              v-model="importModelForm.company"
              :label="$t('Company')"
              :placeholder="$t('Company')"
              :items="companies"
              item-title="label"
              item-value="id"
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

  <VCard
    class=""
    :title="$t('import_models')"
    v-if="$can('import_models.index')"
  >
    <template #append>
      <VBtn
        color="primary"
        @click="openModal('add')"
        v-if="$can('import_models.store')"
      >
        {{ $t("add") }}
      </VBtn>
    </template>

    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="importModels"
      :total="total"
      :per_page="10"
      :is-loading="isImportModelsLoading"
      :filter="filters"
      @change-filter="changeFilter"
    >
    <template #item.module_name="{ item }">
      {{ $t(item.module_name ?? "") }} 
    </template>
    <template #item.import_type_balance="{ item }">
      <span v-if="item.import_type_balance">
        {{ $t('Enums.'+item.import_type_balance ?? "")}}      
      </span>
      <span v-else class="mx-8">
        -
      </span>
    </template>
      <template #item.file_name="{ item }">
        <a
          :href="item.file_url_download"
          target="_blank"
          style="cursor: pointer"
        >
          <VChip
            style="cursor: pointer"
            label
            size="small"
            color="primary"
            class="me-2"
          >
            {{ item.file_name }}
          </VChip>
          <VChip
            v-if="item.module_name == 'balance'"
            style="cursor: pointer"
            label
            size="small"
            color="secondary"
            class="me-2"
          >
            {{ item.import_type_balance }}
          </VChip>
        </a>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <!-- <TooltipIcon
            v-if="$can('import_models.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="handleEditItem(item, true)"
          /> -->
          <TooltipIcon
            v-if="$can('import_models.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="handleEditItem(item)"
          />
          <TooltipIcon
            v-if="$can('import_models.destroy')"
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
import company from "@/router/routes/company";
import { useCoreStore, useImportModelsStore } from "@/stores";
import { useRouter } from "vue-router";
import { isEmpty, map } from "lodash";

definePage({ meta: { navActiveLink: "settings-import-models" } });

const t = inject("t");

const coreStore = useCoreStore();

const router = useRouter();
const selected = ref([]);
const settingsModules = ref([]);
const companies = ref([]);
const { enums } = storeToRefs(coreStore);
const importModelsStore = useImportModelsStore();
const {
  importModels,
  isImportModelsLoading,
  isImportModelLoading,
  total,
  filters,
  isLoadingImportAccountType,
} = storeToRefs(importModelsStore);
const shouldFileBeChanged = ref(false);
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const selectedImportModel = ref(null);
const action = ref("");
const importModelForm = ref({
  module: "",
  company: "",
  file: "",
});
const showSnackbar = inject("showSnackbar");

const dialogTitle = computed(() => {
  return selectedImportModel.value
    ? action.value == "edit"
      ? "Update Import Model"
      : "show Import Model"
    : "New Import Model";
});
const form = ref()
const getModules = (modules) => {
  console.log(modules);
  return Object.keys(modules).map(obKey => {
    return { id: modules[obKey].id, name: t(`${modules[obKey].name}`) }
  })
}

onMounted(async () => {
  await importModelsStore.getDTimportModels();
  const { data } = await useApi("settings/modules/import").get();
  settingsModules.value = data.value.data;
  const { data: companiesData } = await useApi(
    "companies/getOnlyActiveCompanies"
  ).get();
  companies.value = companiesData.value;
});
const SettingsModule = computed(() =>
  map(settingsModules.value, (module) => {
    return { ...module, name: t(`${module?.name}`) };
  })
);
const headers = ref([
  
   {
    title: t("module"),
    sortable: true,
    key: "module_name",
    filtervalue: "",
    selectvalue: SettingsModule,
    filterable: true,
    typefilter: "select",
    itemKey: "id",
    itemTitle: "name",
  },
   
  {
    title: t("type"),
    sortable: true,
    key: "import_type_balance",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Company"),
    sortable: true,
    key: "company_label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("file"),
    sortable: false,
    key: "file_name",
    filtervalue: "",
    filterable: false,
    typefilter: "text",
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

function changeFilter(...obj) {
  importModelsStore.getDTimportModels(...obj);
}

function handleEditItem(item, isShow = false) {
  // open modal with pre-filled data
  importModelForm.value = {
    ...item,
    module: item.module.id,
    file: null,
    company: item.company.id,
    import_type_balance:item.import_type_balance
  };
  if (isShow) {
    return openModal("show", {
      ...item,
      module: item.module.id,
      company: item.company.id,
      file: null,
    });
  }
  openModal("edit", {
    ...item,
    module: item.module.id,
    company: item.company.id,
    file: null,
  });
}

function openModal(actionName, item = null) {
  action.value = actionName;
  selectedImportModel.value = item;
  isDialogVisible.value = true;
}

function openDeleteModal(item) {
  selectedImportModel.value = item;
  isDeleteDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  isDeleteDialogVisible.value = false;
  importModelForm.value = {
    module: "",
    file: "",
    company: "",
  };
  action.value = "";
  selectedImportModel.value = null;
  shouldFileBeChanged.value = false;
}

async function SubmitEvent() {
  form.value.validate().then(async ({ valid }) => {
    if (!valid) return
  let statusCode, data;
  if (!importModelForm.value.file && action.value == "add") {
    showSnackbar(t("Import file is required"), { color: "error" });
    return;
  }

  if (!importModelForm.value.module) {
    showSnackbar(t("module is required"), { color: "error" });
    return;
  }

  if (!importModelForm.value.company) {
    showSnackbar(t("company is required"), { color: "error" });
    return;
  }

  if (
    action.value === "edit" &&
    shouldFileBeChanged.value &&
    !importModelForm.value.file
  ) {
    showSnackbar(t("Import file is required"), { color: "error" });
    return;
  }

  if (action.value === "edit") {
    ({ statusCode, data } = await importModelsStore.updateImportModel(
      selectedImportModel.value.id,
      importModelForm.value,
      shouldFileBeChanged.value
    ));
  } else {
    ({ statusCode, data } = await importModelsStore.addImportModel(
      importModelForm.value,
      action.value !== "add"
    ));
  }

  if (statusCode == 201 || statusCode == 200) {
    importModelsStore.getDTimportModels();
    action.value === "edit"
      ? showSnackbar(t("file updated"), { color: "success" })
      : showSnackbar(t("file created"), { color: "success" });
    closeModal();
  } else {
    showSnackbar(t(data?.message ?? "") ?? t("try again in a few seconds"), {
      color: "error",
    });
  }

  onBeforeUnmount(async () => {
    await importModelsStore.reset("importModels");
  });
})
}

async function deleteAccountType() {
  const { statusCode, data } = await importModelsStore.deleteAccountType(
    selectedImportModel.value.id
  );

  if (statusCode == 204) {
    closeModal();
    showSnackbar(t("Deleted ok"), { color: "success" });
    importModelsStore.getDTimportModels();
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
