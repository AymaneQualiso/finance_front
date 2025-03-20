<template>
  <VDialog v-model="isDeleteDialogVisible" persistent max-width="600">
    <DialogCloseBtn :disabled="isGroupLoading" @click="closeModal" />
    <VCard
      title="Confirmer"
      :loading="isGroupLoading"
      :disabled="isGroupLoading"
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
          :disabled="isGroupLoading"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          @click="deleteGroup"
          :disabled="isGroupLoading"
          :loading="isGroupLoading"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isGroupLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t(dialogTitle)"
      :loading="isGroupLoading"
      :disabled="isGroupLoading"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <!-- <AppTextField
              v-model="groupFrom.label"
              :label="$t('label')"
              :placeholder="$t('label')"
              :clearable="action != 'show'"
              @input="errorMessages.label = null"
              :error-messages="errorMessages.label"
              class="mt-2 required"
              :readonly="action === 'show'"
            /> -->

            <AppCombobox
              v-model="groupFrom.company"
              :label="$t('Company')"
              :placeholder="$t('Company')"
              :items="companies"
              item-title="label"
              item-value="id"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
              :error-messages="errorMessages.company"
            />
            <AppCombobox
              v-model="groupFrom.settings_module"
              :label="$t('settings_module')"
              :placeholder="$t('settings_module')"
              :items="modules"
              item-title="name"
              item-value="id"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
              :error-messages="errorMessages.settings_module"
            />
            <AppCombobox
              v-model="groupFrom.intervention"
              :label="$t('intervention')"
              :placeholder="$t('intervention')"
              :items="[
                { id: 'Traitement', name: 'Traitement' },
                { id: 'Validation', name: 'Validation' },
              ]"
              item-title="name"
              item-value="id"
              :rules="[requiredValidator]"
              class="mt-2 required"
              :return-object="false"
              :readonly="action === 'show'"
              :error-messages="errorMessages.intervention"
            />
            <AppCombobox
              v-model="groupFrom.users"
              :label="$t('users')"
              :placeholder="$t('users')"
              class="mt-2 required"
              chips
              multiple
              :items="users"
              item-title="name"
              item-value="id"
              :return-object="false"
              :rules="[requiredValidator]"
              :readonly="action === 'show'"
              :closable-chips="action !== 'show'"
              :error-messages="errorMessages.users"
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
    :title="$t('groups')"
    :is-import-dialog-visible="isImportDialogVisible"
    :export-file-link="exportFileLink"
    :is-uploading="isLoadingImportGroup"
    :example-data="exampleData"
    :fields-data="fieldsData"
    :required-fields="requiredFieldsData"
    :rows-error="rowsError"
    @close="isImportDialogVisible = false"
    @on-submit="importGroups"
    @remove-file="exportFileLink = null"
    :downloadExampleFile="false"
    exampleFileName="/import-template/groups.xlsx"
    FileName="Exemplaire Groupes.xlsx"
  />

  <VCard class="" :title="$t('groups')" v-if="$can('groups.index')">
    <template #append>
      <VBtn
        v-if="$can('groups.export')"
        class="me-2"
        color="primary"
        @click="exportData"
        :disabled="isDownloadingExport || !groups.length"
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{
          isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export")
        }}
      </VBtn>
      <!--
      <VBtn
        v-if="$can('groups.import')"
        color="primary"
        @click="isImportDialogVisible = true"
        :loading="isLoadingImportGroup"
        class="me-2"
      >
        {{ $t("ImportMd.Import") }}
      </VBtn> -->
      <VBtn
        color="primary"
        @click="openModal('add')"
        v-if="$can('groups.store')"
      >
        {{ $t("add") }}
      </VBtn>
    </template>

    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="groups"
      :total="total"
      :per_page="10"
      :is-loading="isGroupsLoading"
      :filter="filters"
      @change-filter="changeFilter"
      :show-select="$can('groups.export')"
    >
      <template #item.company="{ item }">
        {{ item.company.label }}
      </template>
      <template #item.settings_module="{ item }">
        {{ t(item.settings_module.name) }}
      </template>
      <template #item.users="{ item }">
        <VChip
          v-for="(user, index) in item.users.slice(0, 2)"
          :key="user.id"
          color="primary"
          class="me-1"
        >
          <span>
            {{ user.name }}
          </span>
        </VChip>
        <VChip v-if="item.users.length > 2" color="primary" class="ml-1"
          >...
        </VChip>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('groups.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="handleEditItem(item, true)"
          />
          <TooltipIcon
            v-if="$can('groups.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="handleEditItem(item)"
          />
          <TooltipIcon
            v-if="$can('groups.destroy')"
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
import {
  useGroupsStore,
  useCoreStore,
  useCompanyStore,
  useUserStore,
} from "@/stores";
import { isEmpty, map } from "lodash";

definePage({ meta: { navActiveLink: "settings-groups" } });

const t = inject("t");

const coreStore = useCoreStore();
const groupsStore = useGroupsStore();

const selected = ref([]);
const { enums } = storeToRefs(coreStore);
const {
  groups,
  companies,
  modules,
  users,
  isGroupsLoading,
  isDownloadingExport,
  isGroupLoading,
  total,
  filters,
  isLoadingImportGroup,
} = storeToRefs(groupsStore);

const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isImportDialogVisible = ref(false);
const selectedGroup = ref(null);
const action = ref("");
const groupFrom = ref({
  // label: "",
  company: null,
  settings_module: null,
  users: null,
  intervention: null,
});
const fieldsData = ref({
  Libellé: "label",
  Société: "company_id",
  Module: "settings_module_id",
  Utilisateurs: "users",
});
const requiredFieldsData = ref([
  "label",
  "company_id",
  "settings_module_id",
  "users",
]);
const errorMessages = ref({
  // label: null,
});
const SettingsModule = computed(() =>
  map(modules.value, (module) => {
    return { ...module, name: t(`${module?.name}`) };
  })
);
const showSnackbar = inject("showSnackbar");

const dialogTitle = computed(() => {
  return selectedGroup.value
    ? action.value == "edit"
      ? "Update Group"
      : "show Group"
    : "New Group";
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
    title: t("intervention"),
    sortable: true,
    key: "intervention",
    filtervalue: "",
    selectvalue: [
    { name: "Traitement", id: "Traitement" },
    { name: "Validation", id: "Validation" },
  ],
    filterable: true,
    typefilter: "select",
      itemKey: "id",
    itemTitle: "name",
  },
  {
    title: t("Company"),
    sortable: false,
    key: "company",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("settings_module"),
    sortable: false,
    key: "settings_module",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    selectvalue: SettingsModule,
    itemKey: "id",
    itemTitle: "name",
  },
  {
    title: t("users"),
    sortable: false,
    key: "users",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);


onMounted(async () => {
  await groupsStore.getDTgroups();
  await groupsStore.fetchSelectData();
});

const exportData = async () => {
  await groupsStore.exportGroups({ ids: selected.value });
};

async function importGroups(payload) {
  isLoadingImportGroup.value = true;
  const res = await groupsStore.importGroups(payload);

  if (res) {
    isImportDialogVisible.value = false;
    showSnackbar(t("group_import_success"), { color: "success" });
  } else {
    isImportDialogVisible.value = false;
    showSnackbar(t("Imported failed"), { color: "error" });
  }
  isLoadingImportGroup.value = false;
}

function changeFilter(...obj) {
  groupsStore.getDTgroups(...obj);
}

function handleEditItem(item, isShow = false) {
  // open modal with pre-filled data
  let itm = JSON.parse(JSON.stringify(item)); // Deep copy to ensure 'item' remains unchanged
  itm.settings_module = itm.settings_module.id;
  itm.company = itm.company.id;
  let userIds = itm.users.map((user) => user.id);
  itm.users = userIds;
  groupFrom.value = { ...itm };
  if (isShow) {
    return openModal("show", itm);
  }
  openModal("edit", itm);
}

function openModal(actionName, item = null) {
  action.value = actionName;
  selectedGroup.value = item;
  isDialogVisible.value = true;
}

function openDeleteModal(item) {
  selectedGroup.value = item;
  isDeleteDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  isDeleteDialogVisible.value = false;
  groupFrom.value = {
    // label: "",
    company: null,
    settings_module: null,
    users: [],
  };
  errorMessages.value = {
    // label: null,
    company: null,
    settings_module: null,
    users: null,
  };
  action.value = "";
  selectedGroup.value = null;
}

async function SubmitEvent() {
  errorMessages.value = {
    // label: null,
    company: null,
    settings_module: null,
    users: null,
  };
  let errors = false;
  // if (!groupFrom.value.label) {
  //   errorMessages.value.label = t("field_required");
  //   errors = true;
  // }
  if (!groupFrom.value.users || groupFrom.value.users.length == 0) {
    errorMessages.value.users = t("field_required");
    errors = true;
  }
  if (!groupFrom.value.company) {
    errorMessages.value.company = t("field_required");
    errors = true;
  }
  if (!groupFrom.value.settings_module) {
    errorMessages.value.settings_module = t("field_required");
    errors = true;
  }
  if (!groupFrom.value.intervention) {
    errorMessages.value.intervention = t("field_required");
    errors = true;
  }

  if (errors === true) return;
  let statusCode, data;
  if (action.value === "edit") {
    if (groupFrom.value.label) delete groupFrom.value.label;
    ({ statusCode, data } = await groupsStore.updateGroup(
      selectedGroup.value.id,
      groupFrom.value
    ));
  } else {
    ({ statusCode, data } = await groupsStore.addGroup(
      groupFrom.value,
      action.value !== "add"
    ));
  }

  if (statusCode == 201 || statusCode == 200) {
    groupsStore.getDTgroups();
    showSnackbar(
      action.value == "add"
        ? t("Groupe créé avec succès.")
        : t("Groupe modifié avec succès."),
      { color: "success" }
    );
    closeModal();
  } else {
    showSnackbar(data?.message  ?? t("try again in a few seconds"), {
      color: "error",
    });
  }

  onBeforeUnmount(async () => {
    await groupsStore.reset("groups");
  });
}

async function deleteGroup() {
  const { statusCode, data } = await groupsStore.deleteGroup(
    selectedGroup.value.id
  );

  if (statusCode == 204) {
    closeModal();
    showSnackbar(t("Deleted ok"), { color: "success" });
    groupsStore.getDTgroups();
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
