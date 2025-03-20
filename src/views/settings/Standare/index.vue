<template>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isStandarSaving" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="dialogTitle"
      :loading="isStandarSaving"
      :disabled="isStandarSaving"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="chartAccountForm.label"
              :label="$t('Standard')"
              :placeholder="$t('Standard')"
              clearable
              @input="errorMessages.label = null"
              :error-messages="errorMessages.label"
              class="mt-2 required"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">{{
          t("Cancel")
        }}</VBtn>
        <VBtn @click="SubmitEvent"> {{ t("Confirm") }} </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isDeleteDialogVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t("Confirm") }}</VCardTitle>
      <VCardText>{{ $t("Deleting msg") }}</VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isDeleteDialogVisible = false"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn @click="confirmDelete">
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard :title="$t('Standards')" v-if="$can('standard.index')">
    <template #append>
      <VBtn
        class="me-2"
        color="primary"
        v-if="$can('standard.export')"
        @click="exportData"
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
        :disabled="standars.length === 0"
      >
        {{
          isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export")
        }}
      </VBtn>
      <VBtn
        color="primary"
        class="me-2"
        @click="openImportModal('import')"
        :loading="isLoadingImportStandard"
        :disabled="isLoadingImportStandard"
        v-if="$can('standard.import')"
      >
        {{ $t("ImportMd.Import") }}
      </VBtn>
      <VBtn
        class="me-2"
        color="primary"
        @click="openModal('add')"
        v-if="$can('standard.store')"
      >
        {{ $t("add") }}
      </VBtn>
      <ImportDialog
        :title="$t('ImportMd.Title', { model: t('Standards') })"
        :is-import-dialog-visible="isImportDialogVisible"
        :export-file-link="exportFileLink"
        :isUploading="isLoading"
        :example-data="exampleData"
        :fields-data="fieldsData"
        :required-fields="requiredFieldsData"
        :rows-error="rowsError"
        @close="isImportDialogVisible = false"
        @on-submit="handleImport"
        @remove-file="exportFileLink = null"
        :downloadExampleFile="false"
        exampleFileName="/import-template/standards.xlsx"
        FileName="Exemplaire Standards.xlsx"
      />
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="standars"
      :total="total"
      :per_page="10"
      :is-loading="isLoading"
      :filter="filter"
      @update:order="saveNewOrder"
      @change-filter="changeFilter"
      :show-select="$can('standard.export')"
    >
      <template #item.label="{ item }">
        {{ capitalizeFirstLetter(item.label) }}
      </template>
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.created_by="{ item }">
        <span>{{ item.created_by?.name }}</span>
      </template>
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleDateString("fr-FR") }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('standard.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="viewStandar(item)"
          />
          <TooltipIcon
            v-if="$can('standard.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="editStandar(item)"
          />
          <TooltipIcon
            v-if="$can('standard.destroy')"
            :tooltip-text="$t('delete')"
            icon="tabler-trash"
            color="error"
            @click="showDeleteDialog(item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useCoreStore } from "@/stores";
import { useStandarStore } from "@/stores/useStandarStore";
import { ref, computed, onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { getToken } from "@/services/JwtService";
import { fetch } from "ofetch";

const standarStore = useStandarStore();
const {
  standars,
  isStandarsLoading,
  isStandarSaving,
  total,
  filter,
  // getAllStandars,
  // addStandar,
  // updateStandar,
  // deleteStandar
} = storeToRefs(standarStore);

const router = useRouter();
const selected = ref([])
const t = inject("t");
const showSnackbar = inject("showSnackbar");
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const action = ref("");
const selectedItem = ref(null);
const isLoading = ref(false);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDownloadingExport = ref(false);
const isImportDialogVisible = ref(false);
const isLoadingImportAnalyticalAxie = ref(false);

const requiredFieldsData = ref([
  "Standard",
  "catégories",
  "Sous-catégories",
  "Sections",
]);

const fieldsData = ref({
  Standard: "Standard",
  catégories: "catégories",
  "Sous-catégories": "Sous-catégories",
  Sections: "Sections",
});

const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);

const chartAccountForm = ref({
  label: "",
  created_by: null,
  created_at: "",
});
const errorMessages = ref({
  label: null,
  created_by: null,
  created_at: null,
});
const dialogTitle = computed(() => {
  return action.value === "add"
    ? "Ajouter une nouvelle Standard"
    : "Modifier la  Standard";
});

const headers = ref([
  {
    title: t("Standards"),
    key: "label",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Created at"),
    key: "created_at",
    sortable: true,
    filterable: true,
    typefilter: "date",
  },
  {
    title: t("created by"),
    key: "created_by",
    sortable: false,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("is_active"),
    sortable: true,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  { title: "", key: "actions", sortable: false },
]);

async function loadStandard() {
  isLoading.value = true;
  await standarStore.getStandars();
  isLoading.value = false;
}

onMounted(async () => {
  await loadStandard();
});

// function changeFilter(newFilters) {
//   // Merge new filters with existing filters
//   standarStore.filter = { ...standarStore.filter, ...newFilters };

//   // Ensure no null or empty values are sent in the filter object
//   const filteredValues = Object.fromEntries(
//     Object.entries(standarStore.filter).filter(
//       ([key, value]) => value !== null && value !== ""
//     )
//   );

//   // Reload the standards list with updated filters
//   loadStandard();
// }

function changeFilter(...obj) {
  standarStore.getStandars(...obj);
}

function openModal(actionName, item = null) {
  action.value = actionName;
  chartAccountForm.value = item ? { ...item } : { label: "" };
  isDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  chartAccountForm.value = { label: "", created_by: null, created_at: "" };
  errorMessages.value = { label: null, created_by: null, created_at: null };
  action.value = "";
}

async function SubmitEvent() {
  if (!chartAccountForm.value.label) {
    errorMessages.value.label = t("field_required");
    return;
  }

  const standarData = {
    id: selectedItem.value?.id,
    label: chartAccountForm.value.label,
  };

  const result =
    action.value === "add"
      ? await standarStore.addStandar(standarData)
      : await standarStore.updateStandar(standarData);

  if (result) {
    closeModal();
    loadStandard();
    showSnackbar(t("Standard created successfully"), {
      color: "success",
    });
  } else {
    errorMessages.value = result.error;
  }
}

function showDeleteDialog(item) {
  selectedItem.value = item;
  isDeleteDialogVisible.value = true;
}

function openImportModal(action_name) {
  if (action_name === "import") {
    isImportDialogVisible.value = true;
  }
}

async function confirmDelete() {
  if (selectedItem.value) {
    const success = await standarStore.deleteStandar(selectedItem.value.id);
    if (!success) {
      loadStandard();

      showSnackbar(t("Standard deleted successfully"), { color: "success" });
    } else {
      showSnackbar(t("Failed to delete standard"), { color: "error" });
    }
  }
  isDeleteDialogVisible.value = false;
}

async function exportData() {
  try {
    isDownloadingExport.value = true;

    await standarStore.exportStandars({ format: "xlsx", ids: selected.value });
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting standards:", error);
    showSnackbar(t("Failed to export standards"), { color: "error" });
  } finally {
    isDownloadingExport.value = false;
  }
}
async function handleImport(payload) {
  try {
    const success = await standarStore.importStandard(payload);

    if (success) {
      showSnackbar(t("Import completed successfully!"), { color: "success" });
      isImportDialogVisible.value = false;
      loadStandard();
    } else {
      showSnackbar(t("Import failed. Please check the error file."), {
        color: "error",
      });
      isImportDialogVisible.value = false;
    }
  } catch (error) {
    console.error("Error during import:", error);
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }
}

function viewStandar(item) {
  router.push({
    name: "category-list",
    params: { id: item.id },
    query: { mode: "view" },
  });

  localStorage.removeItem("standardCategoryId");
  localStorage.setItem("standardCategoryId", item.id);
}
function editStandar(item) {
  router.push({
    name: "category-list",
    params: { id: item.id },
    query: { mode: "edit" },
  });
  localStorage.removeItem("standardCategoryId");
  localStorage.setItem("standardCategoryId", item.id);
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
