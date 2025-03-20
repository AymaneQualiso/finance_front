<template>
  <VForm ref="exampleForm">
    <VCard class="" v-if="$can('standard_categories.update')">
      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t('Category') }}</span>
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
          v-if="!isViewMode">
          {{ $t("edit") }}
        </VBtn>
  </template>
  <VRow class="my-4 mx-2">
    <!-- Label Field -->
    <VCol cols="4">
      <VTextField
        v-model="form.label"
        :label="t('Standard Categories Label')"
        :placeholder="t('Standard Categories Label')"
        :readonly="isViewMode"
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

    <VCard class="mt-4" v-if="$can('subcategories.index')">
      <template #append>
        <VBtn class="me-2" color="primary" @click="openModal('add')"  v-if="!isViewMode && $can('subcategories.store')" >
          {{ $t("add") }}
        </VBtn>

         <VBtn
        class="me-2"
        color="primary"
        @click="exportData"
        v-if="$can('subcategories.export')"
        :disabled="isDownloadingExport || SubCategories.length===0 "
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{ isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export") }}
      </VBtn>
      </template>
      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t('Sous-catégories') }}</span>
        </div>
      </template>

      <DatatableCoreDrag
        v-model="selected"
        :headers="headers"
        :items="SubCategories"
        :loading="isLoading"
        :total="total"
        :per_page="10"
        :filter="filter"
        @change-filter="changeFilter"
        @update:order="saveNewOrder"
        :editStandar="editStandar"
        :viewStandar="viewStandar"
        :showDeleteDialog="showDeleteDialog"
         :isViewMode="isViewMode"
         :is_active_check="canDisplayAddButton"
        modelName="subcategories"
        :show-select="$can('subcategories.export')"
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

  <VDialog v-model="isAddDialogVisible" max-width="500px" persistent>
    <VCard>
      <VCardTitle class="text-h6">{{ $t("Ajouter une sous-catégorie") }}</VCardTitle>
      <VCardText>
        <AppTextField
          v-model="newSubCategory.label"
          :label="t('label')"
          :placeholder="t('label')"
          :rules="[requiredValidator]"
          clearable
          :error-messages="errorMessages?.label"
        />
      </VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VSpacer />
        <VBtn color="secondary" text @click="closeModal">{{ $t("Cancel") }}</VBtn>
        <VBtn color="primary" @click="saveNewSubCategory">{{ $t("Confirm") }}</VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isDeleteDialogVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t('Delete Standard') }}</VCardTitle>
      <VCardText>{{ $t('Are you sure you want to delete this standard?') }}</VCardText>
      <VCardActions class="d-flex justify-end">
        <VBtn color="secondary" @click="isDeleteDialogVisible = false">{{t('Cancel')}}</VBtn>
        <VBtn color="red" @click="confirmDelete">{{t('delete')}}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>


<script setup>
import { ref, onMounted, computed, inject } from "vue";
import { useRoute, useRouter} from "vue-router";
import { useSubCategoryStore } from "@/stores/useSubCategoryStore";
import { useStandardCategoryStore } from "@/stores/useStandardCategoryStore"; 
import { getToken } from "@/services/JwtService";
import axios from 'axios';
import {  useCoreStore } from "@/stores";

const errorMessages = ref({label:""});

// Initialize stores
const route = useRoute();
const standardCategoryStore = useStandardCategoryStore();
const  Subcategory=useSubCategoryStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDeleteDialogVisible = ref(false);
const router = useRouter();
const isDownloadingExport= ref(false);
const nbrCategories = computed(() => standardCategoryStore.CategoryCount);
const isAddDialogVisible = ref(false);
const newSubCategory = ref({
  label: "",
});
const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);
const selected = ref([])

const {
  SubCategories,
  // fetchSubCategories,
  // deleteSubCategory,
  // isLoading: isCategoryLoading,
  // addSubCategory,
  total,
  filter

} = storeToRefs(Subcategory);


const isDialogVisible = ref(false);
const isLoading = ref(false);
  const { id } = route.params;
  const { mode } = route.query;

  const selectedItem = ref(null);
const t = inject("t");
const showSnackbar = inject("showSnackbar");

const isViewMode = ref(false);
const storedCategoryId = ref(null);

const canDisplayAddButton = computed(() => {
  return form.value.is_active !== 'inactive'; // Hide button only when is_active is 'Inactive'
});

const statusItems = [
  { label: 'active', value: 'active' },
  { label: 'désactive', value: 'inactive' }
];



onMounted(() => {

  if (route.query.mode === 'view') {
    isViewMode.value = true;
  }
   storedCategoryId.value = localStorage.getItem('standardCategoryId');
});

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

// Computed property for formatted creation datee


// Load standard category data based on the selected standard ID
async function loadSubCategories(id) {
  isLoading.value = true;
  await Subcategory.fetchSubCategories({ standard_category_id: id });
  isLoading.value = false;
}
//nono

function loadStandarCategoryData(id) {
  standardCategoryStore.getStandardCategory(id).then(() => {
    form.value = { ...standardCategoryStore.currentStandardCategory };
    isDialogVisible.value = true;
  });
}

// Method to handle updating the standard data

async function updateStandarCategory() {

    
    const payload = {
    id: id,
    label: form.value.label,
    is_active: form.value.is_active,
  };

    const result = await standardCategoryStore.updateStandardCategory(payload);
  // const result = await standardCategoryStore.updateStandardCategory({
  //   id: id,
  //   label: form.value.label,
  //   is_active: form.value.is_active, // Ensure this matches the backend field

    
  // });
 
  if (result) {
    showSnackbar(t("category updated successfully"), { color: "success" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
    console.error("Failed to update standard");
  }
}

function submitForm() {
  isLoading.value = true;
  updateStandarCategory().finally(() => {
    isLoading.value = false;
  });
}

// Open modal for adding new standard category
function openModal(action) {
   isAddDialogVisible.value = true;
  newSubCategory.value.label = "";
}

function closeModal() {
    isAddDialogVisible.value = false;

}

function viewItem(item) {
  // Logic to view the selected item
}

function editItem(item) {
  // Logic to edit the selected items
}


async function saveNewSubCategory() {
  if (!newSubCategory.value.label) {
    errorMessages.value.label = "Ce champ est obligatoire";
    return;
  }

   const payload = {
    ...newSubCategory.value,
    standard_category_id: route.params.id, 
  };

  
    const result = await Subcategory.addSubCategory(payload);
    if (result) {
      closeModal();
      loadSubCategories(route.params.id); 
      
      showSnackbar(t("Sub Category added successfully"), { color: "success" });
      errorMessages.value.label=null;
    } else {
      errorMessages.value.label=null;
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  
}
function showDeleteDialog(item) {
  selectedItem.value = item;
  isDeleteDialogVisible.value = true;
}



function viewStandar(item) {
  router.push({ name: "Section-list", params: { id: item.id}, query: { mode: 'view',categoryId:  item.standard_category_id } });
}
function editStandar(item) {
  router.push({ name: "Section-list", params: { id: item.id}, query: { mode: 'edit',categoryId:  item.standard_category_id } });
  }

async function confirmDelete() {
  if (selectedItem.value) {
    const success = await Subcategory.deleteSubCategory(selectedItem.value.id);
    if (success) {
       loadSubCategories();

      showSnackbar(t("Sub categories deleted successfully"), { color: "success" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  }
  isDeleteDialogVisible.value = false;
}

const saveNewOrder = async (newOrder) => {
  try {
    const token = await getToken(); // Assume you have a token getterso
    await axios.post(`${API_BASE_URL}/order-sub-category`, { order: newOrder }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

async function exportData() {
  try {
    isDownloadingExport.value = true; 
    await Subcategory.exportsubcategory({ format: 'xlsx', standard_category_id: id, ids: selected.value }); 
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting standards:", error);
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  } finally {
    isDownloadingExport.value = false; 
  }
}


// function changeFilter(newFilters) {
//   Subcategory.filter = { ...Subcategory.filter, ...newFilters };

 

//   loadSubCategories(id);
// }

function changeFilter(...obj) {
  Subcategory.fetchSubCategories(...obj);
}

function retourEtapePrécédente() {
  router.push({ name: "category-list",params: { id: storedCategoryId.value } ,query: { mode: mode },
});
}

// Load standard categories when component is mounted
onMounted(async() => {
  loadSubCategories(id);
  if (id) {
    loadStandarCategoryData(id);
  }
      await standardCategoryStore.fetchStandardallCategories({ standard_id: storedCategoryId.value }); 


});

</script>

<style scoped>
/* Add custom styles if needed */
</style>
