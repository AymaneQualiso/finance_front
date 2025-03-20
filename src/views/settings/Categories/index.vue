<template>
  
  <VForm ref="exampleForm">
     <VCard class="" v-if="$can('standard.update')">
      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t('Standard') }}</span>
        </div>
      </template>
      <template #append>
        <!-- <VRow class="mt-1 d-flex justify-end gap-2 my-3"> -->
          
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
        v-if="!isViewMode"
        class=""
        
        >
        {{ $t("edit") }}
      </VBtn>
      
    </template>
    <!-- </VRow> -->

    <VRow class="px-2 mt-2 py-4">
      <!-- Label Field -->
      <VCol cols="3">
        <VTextField
          v-model="form
          .label"
          :label="t('Standard Label')"
          :placeholder="t('Enter Standard Label')"
         
          :readonly  ="isViewMode"
        />
      </VCol>

      <!-- Creation Date Field -->
      <VCol cols="3">
        <VTextField
          v-model="formattedCreatedAt"
          :label="t('Created at')"
          :placeholder="t('Select Month')"
          readonly  
        />
      </VCol>

      <!-- Created By Field -->
      <VCol cols="3">
        <VTextField
          v-model="form.created_by.name"
          :label="t('created by')"
          :placeholder="t('created by')"
          readonly  
          
        />
      </VCol>
       <VCol cols="3">
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
    </VRow>
  </VCard>
    <VCard class="mt-4" v-if="$can('standard_categories.index')">
      
      <template #append>

           <VBtn class="me-2" color="primary" @click="openModal('add')"  v-if="!isViewMode && $can('standard_categories.store')" >
          {{ $t("add") }}
        </VBtn>
         <VBtn
        class="me-2"
        color="primary"
        @click="exportData"
        :disabled="isDownloadingExport || standardCategories.length===0"
        v-if="$can('standard_categories.export')"
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{ isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export") }}
      </VBtn>
       

      </template>
      <template #title>
        <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t('Categories') }}</span>
        </div>
      </template>

      <DatatableCoreDrag
        v-model="selected"
        :headers="headers"
        :items="standardCategories"
        :is-loading="isLoading"
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
        modelName="standard_categories"
        :show-select="$can('standard_categories.export')"
      >
        <template #item.label="{ item }">
          {{ item.label }}
        </template>
        <template #item.is_active="{ item }">
          {{ item.is_active  }}
        </template>

      </DatatableCoreDrag>
      
    </VCard>

    
  </VForm>
  <VDialog v-model="isAddDialogVisible" max-width="500px" persistent>
  <VCard>
    <VCardTitle class="text-h6">{{ $t('Ajouter une catégorie') }}</VCardTitle>
    
    <VCardText>
      <AppTextField
        v-model="newStandardcategory.label"
        :label="t('label')"
        :placeholder="t('label')"
        :rules="[requiredValidator]"
        clearable
        :error-messages="errorMessages?.label"
      />
    </VCardText>
    
    <VCardText class="d-flex justify-end flex-wrap gap-3">
      <VSpacer />
      <VBtn color="secondary" @click="closeModal">{{ $t("Cancel") }}</VBtn>
      <VBtn color="primary" @click="saveNewStandardCategory">{{ $t("Confirm") }}</VBtn>
</VCardText>
  </VCard>
</VDialog>

<VDialog v-model="isDeleteDialogVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t('Delete Standard') }}</VCardTitle>
      <VCardText>{{ $t('Are you sure you want to delete this standard?') }}</VCardText>
      <VCardActions class="d-flex justify-end">
        <VBtn color="secondary" @click="isDeleteDialogVisible = false">{{ $t('Cancel') }}</VBtn>
        <VBtn color="red" @click="confirmDelete">{{ $t('delete') }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, onMounted, computed, inject, watch  } from "vue";
import { useRoute, useRouter} from "vue-router";
import { useStandarStore } from "@/stores/useStandarStore";
import { useStandardCategoryStore } from "@/stores/useStandardCategoryStore"; 
import { getToken } from "@/services/JwtService";
import {  useCoreStore } from "@/stores";

import axios from 'axios';

const errorMessages = ref({label:""});



// Initialize stores
const isDialogVisible = ref(false);
const selected = ref([])
const isLoading = ref(false);
const isDownloadingExport= ref(false);
    const coreStore = useCoreStore();

    const { enums } = storeToRefs(coreStore);
  const selectedItem = ref(null);
const t = inject("t");
const showSnackbar = inject("showSnackbar");
const route = useRoute();
const { id } = route.params;
const { mode } = route.query;
const standarStore = useStandarStore();
const standardCategoryStore = useStandardCategoryStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDeleteDialogVisible = ref(false);
const router = useRouter();
const isViewMode = ref(false);



onMounted(() => {

  if (route.query.mode === 'view') {
    isViewMode.value = true;
  }
});


const isAddDialogVisible = ref(false);
const newStandardcategory = ref({
  label: "",
});






// Extract relevant properties and actions from the storeats
const {
  standardCategories,
  isLoading: isCategoryLoading,
  total,
  filter

} = storeToRefs(standardCategoryStore);



const form = ref({
  label: "",
  created_by: "",
  created_at: "",
   is_active: "",

});

const rules = {
  required: (value) => !!value || "This field is required",
};

const headers = ref([
  { title: t("label"), key: "label", sortable: false, filterable: true, typefilter: "text" },
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


const formattedCreatedAt = computed({
  get() {
    return form.value.created_at
      ? new Date(form.value.created_at).toLocaleDateString("fr-FR")
      : "";
  },
  set(newDate) {
    const [day, month, year] = newDate.split("/");
    form.value.created_at = new Date(`${year}-${month}-${day}`).toISOString();
  },
});

// Load standard category data based on the selected standard ID
async function loadStandardCategories(id) {
  isLoading.value = true;
  await standardCategoryStore.fetchStandardCategories({ standard_id: id });
  isLoading.value = false;
}
//nono

function loadStandarData(id) {
  standarStore.getStandar(id).then(() => {
    form.value = { ...standarStore.currentStandar };
    // form.value.is_active=t(standarStore.currentStandar.is_active)
    isDialogVisible.value = true;
  });
}

// Method to handle updating the standard data
async function updateStandar() {
  const result = await standarStore.updateStandar({
    id: id,
    label: form.value.label,
    is_active: form.value.is_active,

  });
 
  if (result.res) {
    showSnackbar(t("Standard updated successfully"), { color: "success" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
    console.error("Failed to update standard");
  }
}

function submitForm() {
  isLoading.value = true;
  updateStandar().finally(() => {
    isLoading.value = false;
  });
}

// Open modal for adding new standard category
function openModal(action) {
   isAddDialogVisible.value = true;
  newStandardcategory.value.label = "";
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
async function exportData() {
  try {
    isDownloadingExport.value = true; 
    await standardCategoryStore.exportcategory({ format: 'xlsx', standard_id: id, ids: selected.value }); 
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting standards:", error);
    showSnackbar(t("Failed to export standards"), { color: "error" });
  } finally {
    isDownloadingExport.value = false; 
  }
}

function retourEtapePrécédente() {
  router.push({ name: "standare-list",query: { mode: mode } });
}

const canDisplayAddButton = computed(() => {
  return form.value.is_active !== 'inactive'; 
});




async function saveNewStandardCategory() {
  if (!newStandardcategory.value.label) {
    errorMessages.value.label = "Ce champ est obligatoire";
    return;
  }

   const payload = {
    ...newStandardcategory.value,
    standard_id: route.params.id, 
  };

  
    const result = await standardCategoryStore.addStandardCategory(payload);
    if (result) {
      closeModal();
          loadStandardCategories(id);

      
      showSnackbar(t("Category added successfully"), { color: "success" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  
}
function showDeleteDialog(item) {
  selectedItem.value = item;
  isDeleteDialogVisible.value = true;
}




function viewStandar(item,id) {
  router.push({ name: "Subcategory-list", params: { id: item.id }, query: { mode: 'view' } });
}

function editStandar(item) {
  router.push({ name: "Subcategory-list", params: { id: item.id }, query: { mode: 'edit' } });

  
  }

async function confirmDelete() {
  if (selectedItem.value) {
    const success = await standardCategoryStore.deleteStandardCategory(selectedItem.value.id);
    if (success) {
                  loadStandardCategories(id);



      showSnackbar(t("Standard deleted successfully"), { color: "success" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  }
  isDeleteDialogVisible.value = false;
}

const saveNewOrder = async (newOrder) => {
  try {
    const token = await getToken(); // Assume you have a token getterso
    await axios.post(`${API_BASE_URL}/order-standard-category`, { order: newOrder }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];



// function changeFilter(newFilters) {
//   standardCategoryStore.filter = { ...standardCategoryStore.filter, ...newFilters };

 

//   loadStandardCategories(id);
// }

function changeFilter(...obj) {
  standardCategoryStore.fetchStandardCategories(...obj);
}

onMounted( () => {
   loadStandardCategories(id);
  if (id) {
    loadStandarData(id);
  }

});

</script>

<style scoped>
/* Add custom styles if needed */
</style>
