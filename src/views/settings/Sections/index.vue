<template>
  <VForm ref="exampleForm">
    <!-- <VRow class="mt-1 d-flex justify-end gap-2"> -->
      <VCard class="" v-if="$can('subcategories.update')">
      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t('Sub-category') }}</span>
        </div>
      </template>
      <template #append>
        <VBtn
          color="secondary"
          variant="tonal"
          class="me-2"
          @click="retourEtapePrécédente"
          >
          <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
        </VBtn>
      <VBtn
        color="primary"
        :loading="isLoading"
        @click="submitForm"
        class=""
         v-if="!isViewMode"
      >
        {{ $t("edit") }}
      </VBtn>
      
      </template>
      <VRow class="my-4 mx-2">
        <!-- Label Field -->
        <VCol cols="4">
          <VTextField
            v-model="form.label"
            :label="t('sub category Label')"
            :placeholder="t('sub category Label')"
            clearable
            :readonly  ="isViewMode"
          />
        </VCol>
  
        <!-- Creation Date Field -->
  
        <VCol cols="4">
          <VCombobox
          v-model="form.is_active"
          :readonly="isViewMode"
          :label="$t('Status')"
          :placeholder="$t('Status')"
          :items="getEnums(enums.isActive, $t)"
          item-title="title"
          item-value="key"
          :rules="[requiredValidator]"
          class="required"
          :return-object="false"
        />
        </VCol>
  
  
          <VCol cols="4">
          <VTextField
            v-model="nbrCategories"
            :label="t('nombres Categories')"
            :placeholder="t('nombres Categories')"
            readonly  
          />
        </VCol>
      </VRow>
      </VCard>

    <VCard class="mt-4" v-if="$can('sections.index')">
      <template #append>
       <VBtn class="me-2" color="primary" @click="openModal('add')"  v-if="!isViewMode && $can('sections.store')" >
          {{ $t("add") }}
        </VBtn>

         <VBtn
        class="me-2"
        color="primary"
        v-if="$can('sections.export')"
        @click="exportData"
        :disabled="isDownloadingExport ||  Sections.length===0 "
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{ isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export") }}
      </VBtn>
      </template>
      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>Sections</span>
        </div>
      </template>

      <DatatableCoreDrag
        v-model="selected"
        :headers="headers"
        :items="Sections"
        :loading="isLoading"
        :total="total"
        :per_page="10"
        @update:order="saveNewOrder"
        :editStandar="editStandar"
        :viewStandar="viewStandar"
        :filter="filter"
       @change-filter="changeFilter"
        :showDeleteDialog="showDeleteDialog"
         :isViewMode="isViewMode"
         modelName="sections"
         :show-select="$can('sections.export')"
      >
        <template #item.label="{ item }">
          {{ item.label }}
        </template>
        <template #item.is_active="{ item }">
          <StatusChip :title="item.is_active" />
        </template>
      </DatatableCoreDrag>
    </VCard>
  </VForm>

  <!-- <VDialog v-model="isAddDialogVisible" max-width="500px" persistent>
    <VCard>
      <VCardTitle class="text-h6">{{ $t("Ajouter une Section") }}</VCardTitle>
      <VCardText>
        <VTextField
          v-model="newSection.label"
          label="Label"
          placeholder="Enter Standard Label"
          :rules="[rules.required]"
          clearable
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" text @click="closeModal">{{ $t("Cancel") }}</VBtn>
        <VBtn color="primary" @click="saveNewSection">{{ $t("Save") }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog> -->

  <!-- <VDialog v-model="isAddDialogVisible" max-width="500px" persistent>
    <VCard>
      <VCardTitle class="text-h6">{{ $t("Ajouter une Section") }}</VCardTitle>
      <VCardText>
        <VTextField
          v-model="newSection.label"
          label="Label"
          placeholder="Enter Standard Label"
          :rules="[rules.required]"
          clearable
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" text @click="closeModal">{{ $t("Cancel") }}</VBtn>
        <VBtn color="primary" @click="saveNewSection">{{ $t("Save") }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog> -->

  <VDialog v-model="isAddDialogVisible" max-width="500px" persistent>
  <VCard>
    <VCardTitle class="text-h6">
      {{ dialogMode === 'edit' ? $t("Edit Section") : $t("Ajouter une Section") }}
    </VCardTitle>
    <VCardText>
      <AppTextField
        v-model="newSection.label"
        :label="t('label')"
        :placeholder="t('label')"
        :rules="[requiredValidator]"
        :error-messages="errorMessages?.label"
        clearable
      />
      <VCombobox
          v-model="newSection.is_active"
          :readonly="isViewMode"
          :label="$t('Status')"
          :placeholder="$t('Status')"
          :items="getEnums(enums.isActive, $t)"
          item-title="title"
          item-value="key"
          :rules="[requiredValidator]"
          class="required mt-6"
          :return-object="false"
          v-if="dialogMode === 'edit'"
        />
    </VCardText>
    <VCardText class="d-flex justify-end flex-wrap gap-3">
      <VSpacer />
      <VBtn color="secondary" text @click="closeModal">{{ $t("Cancel") }}</VBtn>
      <VBtn color="primary" @click="saveSection">{{ $t("Confirm") }}</VBtn>
    </VCardText>
  </VCard>
</VDialog>



<VDialog v-model="isViewDialogVisible" max-width="500px" persistent>
  <VCard>
    <VCardTitle class="text-h6">{{ $t("Voir les Détails de la Section") }}</VCardTitle>
    <VCardText>
      <!-- Label Field -->
      <VRow>
        <VCol cols="12">
          <VTextField
            v-model="viewData.label"
            :label="t('label')"
            :placeholder="t('label')"
            readonly
            class="my-2 me-2"
          />
        </VCol>
      </VRow>
      
      <!-- Status Field -->
      <VRow>
        <VCol cols="12">
          <VTextField
            v-model="viewData.is_active"
            :label="t('Status')"
            :placeholder="t('Status')"
            readonly
            class="my-2 me-2"
                :disabled="isViewMode"
          />
        </VCol>
      </VRow>

      


      
    </VCardText>
    <VCardActions class="d-flex justify-end">
      <VBtn color="primary" text @click="closeViewDialog">{{ $t("close") }}</VBtn>
    </VCardActions>
  </VCard>
</VDialog>

  

  <VDialog v-model="isDeleteDialogVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t("Delete Standard") }}</VCardTitle>
      <VCardText>{{
        $t("Are you sure you want to delete this standard?")
      }}</VCardText>
      <VCardActions class="d-flex justify-end">
        <VBtn color="secondary" @click="isDeleteDialogVisible = false"
          >{{('Cancel')}}</VBtn
        >
        <VBtn color="red" @click="confirmDelete">{{t('Confirm')}}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted, computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSubCategoryStore } from "@/stores/useSubCategoryStore";
import { useSectionStore } from "@/stores/useSectionStore";
import { getToken } from "@/services/JwtService";
import { useStandardCategoryStore } from "@/stores/useStandardCategoryStore"; 
import {  useCoreStore } from "@/stores";
const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);
import axios from "axios";

// Initialize stores
const route = useRoute();
const SectionStore = useSectionStore();
const Subcategory = useSubCategoryStore();
const standardCategoryStore = useStandardCategoryStore();
const selected = ref([])
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDeleteDialogVisible = ref(false);
const router = useRouter();
const dialogMode = ref("add");

const isViewMode = ref(false);
const isViewDialogVisible = ref(false);
const viewData = ref({ label: "", is_active: "" });
const nbrCategories = computed(() => standardCategoryStore.CategoryCount);
const isDownloadingExport= ref(false);



onMounted(() => {

  if (route.query.mode === 'view') {
    isViewMode.value = true;
  }
   storedCategoryId.value = localStorage.getItem('standardCategoryId');
});

const isAddDialogVisible = ref(false);
const newSection = ref({
  label: "",
  is_active: "",
});

const {
  Sections,
  // fetchSubCategories,
  // deleteSubCategory,
  // isLoading: isCategoryLoading,
  // addSubCategory,
  total,
  filter
} = storeToRefs(SectionStore);

const isDialogVisible = ref(false);
const isLoading = ref(false);
const { id} = route.params;
const { mode ,categoryId} = route.query;

const selectedItem = ref(null);
const t = inject("t");
const showSnackbar = inject("showSnackbar");
const storedCategoryId = ref(null);
const errorMessages = ref({label:""});


const form = ref({
  label: "",
  is_active: "",
});

const rules = {
  required: (value) => !!value || "This field is required",
};

const headers = ref([
  { title: t("label"), key: "label", sortable: false, filterable: true,typefilter: "text" },
  {
    title: t("is_active"),
    sortable: false,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  { title: "", key: "actions" },
]);

async function loadSection(id) {
  isLoading.value = true;
  await SectionStore.fetchSections({ subcategory_id: id });
  isLoading.value = false;
}

function loadSubCategories(id) {
  

  Subcategory.getSubCategory(id).then(() => {
    form.value = { ...Subcategory.currentSubCategory };
    isDialogVisible.value = true;
  });
}

async function updateSubCategory() {
  const result = await Subcategory.updateSubCategory({
    id: id,
    label: form.value.label,
    is_active: form.value.is_active,

  });

  if (result) {
    showSnackbar(t("Sub categories updated successfully"), {
      color: "success",
    });
  } else {
    console.error("Failed to update standard");
  }
}

// function changeFilter(newFilters) {
//   SectionStore.filter = { ...SectionStore.filter, ...newFilters };

  

//   loadSection
// (route.params.id);
// }

function changeFilter(...obj) {
  SectionStore.fetchSections(...obj);
}


function submitForm() {
  isLoading.value = true;
  updateSubCategory().finally(() => {
    isLoading.value = false;
  });
}

// function openModal(action) {
//   isAddDialogVisible.value = true;
//   newSection.value.label = "";
// }
function openModal(action, section = null) {
  isAddDialogVisible.value = true;
  dialogMode.value = action; // Set dialog mode to 'add' or 'edit'
  
  if (action === "edit" && section) {
    newSection.value = { ...section }; // Load section data for editing
  } else {
    newSection.value.label = ""; // Reset the form for adding
  }
}

function closeModal() {
  isAddDialogVisible.value = false;
}


function openViewDialog(item) {
  viewData.value = { ...item };
  isViewDialogVisible.value = true;
}

function closeViewDialog() {
  isViewDialogVisible.value = false;
}



// async function saveNewSection() {
//   if (!newSection.value.label) {
//     errorMessages.value.label = "Label is required";
//     return;
//   }

//   const payload = {
//     ...newSection.value,
//     subcategory_id: route.params.id,
//   };

//   const result = await SectionStore.addSection(payload);
//   if (result) {
//     closeModal();
//     loadSection(route.params.id);

//     showSnackbar(t("Category added successfully"), { color: "success" });
//   } else {
//     showSnackbar(t("Failed to add category"), { color: "error" });
//   }
// }

async function saveSection() {
  if (!newSection.value.label) {
    errorMessages.value.label = "Ce champ est obligatoire";
    return;
  }

  if (dialogMode.value === "edit") {
    // Edit section logic
    const result = await SectionStore.updateSection(newSection.value);
    if (result) {
      showSnackbar(t("Section updated successfully"), { color: "success" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  } else {
    // Add section logic
    const payload = {
      ...newSection.value,
      subcategory_id: route.params.id,
    };
    const result = await SectionStore.addSection(payload);
    if (result) {
      showSnackbar(t("Section added successfully"), { color: "success" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  }
  
  closeModal();
  loadSection(route.params.id); // Refresh list
}

function showDeleteDialog(item) {
  selectedItem.value = item;
  isDeleteDialogVisible.value = true;
}

function editStandar(item) {
    openModal("edit", item); 
}
function viewStandar(item) {
    openViewDialog(item); 
}

async function confirmDelete() {
  if (selectedItem.value) {
    const success = await SectionStore.deleteSection(selectedItem.value.id);
    if (success) {
      loadSection(route.params.id);

      showSnackbar(t("Section deleted successfully"), { color: "success" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  }
  isDeleteDialogVisible.value = false;
}

const saveNewOrder = async (newOrder) => {
  try {
    const token = await getToken(); // Assume you have a token getterso
    await axios.post(
      `${API_BASE_URL}/order-section`,
      { order: newOrder },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

async function exportData() {
  try {
    isDownloadingExport.value = true; 
    await SectionStore.exportsections({ format: 'xlsx', subcategory_id: id, ids: selected.value }); 
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting standards:", error);
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  } finally {
    isDownloadingExport.value = false; 
  }
}

function retourEtapePrécédente() {
  router.push({ name: "Subcategory-list",params: { id: categoryId},    query: { mode: mode }});
}

const canDisplayAddButton = computed(() => {
  return form.value.is_active !== 'inactive'; // Hide button only when is_active is 'Inactive'
});


onMounted(async () => {
 
  loadSubCategories(id);
  if(id){
     loadSection(id);
  }
              await standardCategoryStore.fetchStandardallCategories({ standard_id: storedCategoryId.value }); 


});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
