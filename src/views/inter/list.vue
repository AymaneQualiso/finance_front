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
        <VForm ref="sendForm" :readonly="modeReadOnly">
        <!-- <VRow>
          <VCol cols="12">
      <AppCombobox
  v-model="chartAccountForm.periodicity"
  :label="$t('periodicite')"
  :placeholder="$t('periodicite')"
  :items="periodTypes"
  item-value="id"
  item-title="label"
  clearable
  :error-messages="errorMessages.periodicity"
  class="mt-2 required"
  :rules="[requiredValidator]"
/>
  




          </VCol>
        </VRow> -->
      <!-- </VCardText>

      <VCardText> -->
        <!-- <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="chartAccountForm.periode"
              type="date"
              :label="$t('periode')"
              :placeholder="$t('periode')"
              clearable
              @input="errorMessages.label = null"
              :error-messages="errorMessages.label"
              class="mt-2 required"
              :readonly="chartAccountForm.id"
              :rules="[requiredValidator]"
            />
          </VCol>
        </VRow> -->
      <!-- </VCardText>
      <VCardText> -->
        <VRow>
          <VCol cols="12">
            <VSelect 
              v-model="chartAccountForm.exercice_id"
              :placeholder="$t('year_exercice')"
              :label="$t('year_exercice')"
              :return-object="false"
              :items="exercices"
              item-title="year"
              item-value="id"
              class="mt-2 required"
              :rules="[requiredValidator]"
              />
              <!-- @change="(value) => { console.log('Selected:', value); fetchAvailableMonths(value); }" -->
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <VSelect 
              :readonly="!chartAccountForm.exercice_id || disableInputMonth"
              v-model="chartAccountForm.month"
              :label="$t('month_exercice')"
              :placeholder="$t('month_exercice')"
              :items="availableMonths"
              item-value="value"
              item-title="label"
              clearable
              :return-object="false"
              :rules="[requiredValidator]"
              class="mt-2 required"
              @update:model-value="(value) => { handleChangeMonth(value)}"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" v-if="chartAccounts.length !== 1">
             <AppCombobox
                v-model="chartAccountForm.chartaccount_id"
                :label="$t('accounts.chart_account')"
                :placeholder="$t('accounts.chart_account')"
                :items="chartAccounts"
                item-title="label"
                item-value="id"
                class="required"
                :return-object="false"
                :loading="isLoadingAccounts"
                :readonly="chartAccountForm.id"
                :rules="[requiredValidator]"
              />
          </VCol>
        </VRow>
        </VForm>
      </VCardText>
     

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal"
          >{{ t('Cancel') }}</VBtn
        >
        <VBtn @click="SubmitEvent" :disabled="isSaving" :loading="isSaving"> {{ t('Confirm') }} </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isDeleteDialogVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t('Confirm') }}</VCardTitle>
      <VCardText>{{ $t('Deleting msg') }}</VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isDeleteDialogVisible = false"
          
        >
          {{ $t('Cancel') }}
        </VBtn>
        <VBtn @click="confirmDelete">
          {{ $t('Confirm') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard :title="$t('Inter Company balances')">
    <template #append>
 

 <!-- <VBtn
    v-if="$can('balances.export')"
        class="me-2"
        color="primary"
        
        @click="exportData"
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
        :disabled="balances.length === 0"
      >
        {{ isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export") }}
      </VBtn> -->
 
      <!-- <VBtn class="me-2" color="primary" @click="openModal('add')" v-if="$can('balances.store')">
        {{ $t("add") }}
      </VBtn> -->
      <ImportDialog
        :title="$t('ImportMd.Title', { model: t('balances') })"
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
         FileName="Exemplaire Balances.xlsx"
      
      />

  
      

      
     
    </template>

    <DataTableCore
      :headers="headers"
      :items="interCompaniesbalance"
      :total="total"
      :per_page="10"
      :isLoading="isLoading"
      :filter="filter"
      @update:order="saveNewOrder" 
      @change-filter="changeFilter"
    >
    <template #loader>
    <div class="loader-container">
      <VProgressCircular indeterminate color="primary" />
            <span>{{ t('Loading...') }}</span>
    </div>
  </template>
      <template #item.label="{ item }">
          <span v-tooltip="item.label">{{ capitalizeFirstLetter(item.label) }}</span>
        </template>
      <template #item.reference="{ item }">
        {{ (item.reference) }}
      </template>
      <template #item.total_bg_ini67="{ item }">
        <div class="text-end">
          {{ (item.total_bg_ini67) }}
        </div>
      </template>
       <template #item.status="{ item }">
    <VChip v-if="item.status" :color="getStatusColor(item.status)">
      {{ item.status }}
    </VChip>
  </template>
      <template #item.total_bg_final67="{ item }">
        <div class="text-end">
          {{ (item.total_bg_final67) }}
        </div>
      </template>
      <template #item.total_bg_final="{ item }">
        <div class="text-end">
          {{ (item.total_bg_final) }}
        </div>
      </template>
      <template #item.date_bg="{ item }">
        {{ formatDate(item.date_bg) }}
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
          v-if="$can('balances.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="viewInterCompany(item.id)"

          />
          <!-- <TooltipIcon
          v-if="$can('balances.update')"

            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="editBalance(item)"
          /> -->
          <!-- <TooltipIcon
           
            :tooltip-text="$t('delete')"
            icon="tabler-trash"
            color="error"
            @click="showDeleteDialog(item)"
            /> -->
    </div>
</template>

    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useCoreStore, useChartAccountStore, useExerciceStore,useAxisTypeStore } from '@/stores';
import { usePeriodTypeStore } from "@/stores/usePeriodTypeStore"; 
import { useInterCompanyStore } from "@/stores";
import { ref, computed, onMounted, inject,watch } from "vue";
import { useRouter } from "vue-router";
import axios from 'axios';
import { getToken } from "@/services/JwtService";
import { isEmpty } from '@/@core/utils/helpers';


const InterCompanyStore = useInterCompanyStore();
const {
  
  interCompaniesbalance,
 
  total,
  filter,
  isSaving
} = storeToRefs(InterCompanyStore);




const sendForm = ref(null)
const router = useRouter();
const t = inject("t");
const showSnackbar = inject("showSnackbar");
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const action = ref("");
const selectedItem = ref(null);
const  isLoading= ref(false);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isDownloadingExport= ref(false);
const isImportDialogVisible = ref(false);
const isLoadingImportAnalyticalAxie = ref(false);
const chartAccountStore = useChartAccountStore();
const { chartAccounts } = storeToRefs(chartAccountStore);
    const periodTypeStore = usePeriodTypeStore();
        const { periodTypes } = storeToRefs(periodTypeStore);
const exerciceStore = useExerciceStore()
const { exercices } = storeToRefs(exerciceStore)
const availableMonths = ref([]);
const disableInputMonth = ref(false)
const axisTypeStore = useAxisTypeStore();










const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);

const chartAccountForm = ref({
  chartaccount_id: null,  
  periodicity: null,      
  periode: null   ,
  year : null, 
});



const errorMessages = ref({
  label: null,
  created_by: null,
  created_at: null,
});
const dialogTitle = computed(() => {
  return action.value === "add" ? "Ajouter une nouvelle balance" : "Modifier la  balance";
}); 

const getStatusColor = (status) => {
    switch (status) {
        case 'Brouillon':
            return 'grey'; 
        case 'Import Initial Réussi':
            return 'primary'; 
        case 'Provisions Terminées':
            return 'info'; 
        case 'Validée':
            return 'success'; 
        default:
            return 'primary'; 
    }
};
const headers = ref([
  { title: t("label"), key: "label", sortable: false, filterable: true, typefilter: "text" },
  { title: t("Reference"), key: "reference", sortable: false, filterable: true, typefilter: "text" },
    {
    title: t("Date BG"),
    key: "date_bg",
    sortable: true,
    filterable: true,
    typefilter: "date",
  },

  { title: t("Total Balance initiale 6 et 7"), key: "total_bg_ini67", sortable: false, filterable: true, typefilter: "range" },
  { title: t("Total Balance finale  6 et 7 "), key: "total_bg_final67", sortable: false, filterable: true, typefilter: "range" },
  { title: t("Total Balance finale "), key: "total_bg_final", sortable: false, filterable: true, typefilter: "range" },
  {
            title: t("status"),
            sortable: true,
            key: "status",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            itemKey: "key",
            itemTitle: "title",
            selectvalue: getEnums(enums.value.balanceStatus, t),
        },






  // {
  //   title: t("is_active"),
  //   sortable: true,
  //   key: "is_active",
  //   filtervalue: "",
  //   filterable: true,
  //   typefilter: "select",
  //   itemKey: "key",
  //   itemTitle: "title",
  //   selectvalue: getEnums(enums.value.isActive, t),
  // },
  { title: "", key: "actions", sortable: false },
]);

async function loadInterCompany() {
  isLoading.value = true;
  await InterCompanyStore.getInterCompanies();
  isLoading.value = false;
}

onBeforeUnmount(() => {
  InterCompanyStore.reset()
})

onMounted(async() => {
      loadInterCompany();
       if (!cachedAxisTypes.length) {
    await loadAxisTypes();
  } else {
    loadAxisTypes();
  }


  await periodTypeStore.fetchPeriodTypes();
       await chartAccountStore.fetchChartAccounts(); 
 if (isEmpty(exercices.value)) await exerciceStore.getExercicesIdYear()
});

watch(
  () => chartAccountForm.value.exercice_id,
  (newExerciceId) => {
    fetchAvailableMonths(newExerciceId);
    chartAccountForm.value.month = null;
  }
);

const handleChangeMonth = (event) => {
  const mnt = availableMonths.value.filter((month) => month.value == event)
  chartAccountForm.value.year = mnt[0].year
}
const fetchAvailableMonths = async (exerciceId) => {
  
  if (!exerciceId) {
    availableMonths.value = [];
    return;
  }

  const { data, statusCode } = await exerciceStore.checkExistingExerciceInBalance(exerciceId);

  disableInputMonth.value = false
  calculateAvailableMonthsLocally(exerciceId);
  if (statusCode === 200) {
    disableInputMonth.value = true
    // chartAccountForm.value.month = data.latest_balance_sheet_head_month + 1;
    chartAccountForm.value.month = (data.latest_balance_sheet_head_month % 12) + 1;
  } else if (statusCode === 400 || statusCode === 404) {
    showSnackbar(t(data.message), { color: "error" });
  } else {
    showSnackbar(t("try again in a few seconds") ,{ color: 'error' });
  }
  handleChangeMonth(chartAccountForm.value.month)
}

function calculateAvailableMonthsLocally(exerciceId) {
  console.log('start calcul by check id', exerciceId);
  
  const selectedExercice = exercices.value.find(
    (ex) => ex.id === exerciceId
  );
  console.log("selected exercice", selectedExercice);
  
  if (!selectedExercice) {
    availableMonths.value = [];
    return;
  }

  const start = new Date(selectedExercice.date_depart_exercice);
  const end = new Date(selectedExercice.date_fin_exercice);

  const months = [];
  let current = new Date(start);

  while (current <= end) {
    months.push({
      value: current.getMonth() + 1,
      label: current.toLocaleString("default", { month: "long" }) + '-' +current.getFullYear(),
      year: current.getFullYear()
    });
    current.setMonth(current.getMonth() + 1);
  }

  availableMonths.value = months;
}

const cachedAxisTypes = JSON.parse(localStorage.getItem("cachedAxisTypesInter")) || [];

const axisTypes = ref(cachedAxisTypes);

const loadAxisTypes = async () => {

  await axisTypeStore.getAxisTypes();
  if (axisTypeStore.axisTypes.length) {
    axisTypes.value = axisTypeStore.axisTypes;

    localStorage.setItem("cachedAxisTypesInter", JSON.stringify(axisTypeStore.axisTypes));
  }

};




// function changeFilter(newFilters) {
//   // Merge new filters with existing filters
//   balanceStore.filter = { ...balanceStore.filter, ...newFilters };

//   const filteredValues = Object.fromEntries(
//     Object.entries(balanceStore.filter).filter(([key, value]) => value !== null && value !== "")
//   );


//   loadBalance();
// }

function changeFilter(...obj) {
  InterCompanyStore.getInterCompanies(...obj);
}

function openModal(actionName, item = {}) {
  action.value = actionName;
  if (!Object.keys(item).length) {
    if (chartAccounts.value.length === 1) {
      item.chartaccount_id = chartAccounts.value[0].id;
      item.label = ""
    }
    if (exercices.value.length === 1) {
      item.exercice_id = exercices.value[0].id
    }
  }
  chartAccountForm.value = { ...item };
  isDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  chartAccountForm.value = { label: "", created_by: null, created_at: "" };
  errorMessages.value = { label: null, created_by: null, created_at: null };
  action.value = "";
}

async function SubmitEvent() {
  // if (!chartAccountForm.value.label) {
  //   errorMessages.value.label = "Label is required";
  //   return;p
  // }
  sendForm.value.validate().then(async ({ valid }) => {
  if (!valid) return

  const balanceData = {
    id: selectedItem.value?.id,  
    chartaccount_id: chartAccountForm.value.chartaccount_id,
      periode: chartAccountForm.value.periode,
      periodicity: chartAccountForm.value.periodicity?.id, 
      exercice_id: chartAccountForm.value.exercice_id,
      month: chartAccountForm.value.month,
      year: chartAccountForm.value.year,
  };
  

  const result =
    action.value === "add"
      ? await balanceStore.addBlance(balanceData)
      : await balanceStore.updateBalance(balanceData);

  if (result.res) {
    closeModal();
    loadBalance()
   showSnackbar(t("Balance created successfully"), {
      color: "success",
    });
    editBalance(result?.data);
  } else {
    errorMessages.value = result.error;
  }
  })
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
    const success = await balanceStore.deleteBalance(selectedItem.value.id);
    if (!success) {
           loadBalance();


      showSnackbar(t("balance deleted successfully"), { color: "success" });
    } else {
      showSnackbar(t("Failed to delete balance"), { color: "error" });
    }
  }
  isDeleteDialogVisible.value = false;
}

function handlePeriodicityChange(selectedItem) {
  chartAccountForm.periodicity = selectedItem.value;  // Only store the value
}





function viewInterCompany(item) {
 
  router.push({ name: "inter-edit", params: { id: item } });


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
