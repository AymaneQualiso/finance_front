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
              v-model="chartAccountForm.scenario"
              :label="$t('scenario')"
              :placeholder="$t('scenario')"
              :items="getEnums(enums.scenarioBilan, t)"
              item-title="title"
              item-value="key"
              :rules="[requiredValidator]"
              class="required"
              :return-object="false"
              :readonly="action === 'show'"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VSelect 
              v-model="chartAccountForm.exercice_id"
              :placeholder="$t('year_exercice')"
              :label="$t('year_exercice')"
              :return-object="false"
              :items="exercices"
              item-title="year_label"
              item-value="id"
              class="mt-2 required"
              :rules="[requiredValidator]"
              @update:model-value="(value) => { calculateAvailableMonthsLocally(value) }"
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
              :item-props="(item) => ({ disabled: item.disabled })"
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

  <VCard :title="$t('Balances')">
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
 
      <VBtn class="me-2" color="primary" @click="openModal('add')" v-if="$can('balances.store')">
        {{ $t("add") }}
      </VBtn>
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
      :items="balances"
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
    </div>
  </template>
      <template #item.label="{ item }">
          <span v-tooltip="item.label">{{ capitalizeFirstLetter(item.label) }}</span>
        </template>
      <template #item.total_bg_ini67="{ item }">
        <div class="text-end">
          {{ formatAmount(item.total_bg_ini67) }}
        </div>
      </template>
      <template #item.status="{ item }">
        <VChip v-if="item.status" :color="getStatusColor(item.status)">
          {{ item.status }}
        </VChip>
        </template>
      <template #item.total_bg_final67="{ item }">
        <div class="text-end">
          {{ formatAmount(item.total_bg_final67) }}
        </div>
      </template>
      <template #item.total_bg_final="{ item }">
        <div class="text-end">
          {{ formatAmount(item.total_bg_final) }}
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
            @click="viewBalance(item)"

          />
          <TooltipIcon
          v-if="$can('balances.update')"

            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="editBalance(item)"
          />
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
import { useBlanceStore } from "@/stores/useBalanceStore";
import { ref, computed, onMounted, inject,watch } from "vue";
import { useRouter } from "vue-router";
import axios from 'axios';
import { getToken } from "@/services/JwtService";
import { isEmpty } from '@/@core/utils/helpers';


const balanceStore = useBlanceStore();
const {
  
  balances,
  isStandarsLoading,
  isStandarSaving,
  total,
  filter,
  isSaving
} = storeToRefs(balanceStore);




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


const cachedAxisTypesLocalStorage = localStorage.getItem("cachedAxisTypes");
const cachedAxisTypes = cachedAxisTypesLocalStorage !== "undefined" ? JSON.parse(cachedAxisTypesLocalStorage) : [];

const axisTypes = ref(cachedAxisTypes);

const formatAmount = (amount) => {
  return amount ? (new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(amount)) : "0,00";
};
const loadAxisTypes = async () => {

  await axisTypeStore.getAxisTypes();
  if (axisTypeStore.axisTypes.length) {
    axisTypes.value = axisTypeStore.axisTypes;

    localStorage.setItem("cachedAxisTypes", JSON.stringify(axisTypeStore.axisTypes));
  }

};










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
        case "Clôturée":
            return "error";
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
  // {
  //   title: t("accounting-plan"),
  //   sortable: true,
  //   key: "chart_account_label",
  //   filtervalue: "",
  //   filterable: true,
  //   typefilter: "select",
  //   itemKey: "id",
  //   itemTitle: "label",
  //   selectvalue: chartAccounts,
  // },
  { title: t("Total BG Ini 6 et 7"), key: "total_bg_ini67", sortable: false, filterable: true, typefilter: "range" },
  { title: t("Total BG finale  6 et 7 "), key: "total_bg_final67", sortable: false, filterable: true, typefilter: "range" },
  { title: t("Total BG finale "), key: "total_bg_final", sortable: false, filterable: true, typefilter: "range" },
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

async function loadBalance() {
  isLoading.value = true;
  await balanceStore.getBlances();
  isLoading.value = false;
}

onMounted(async() => {
   if (cachedAxisTypes && !cachedAxisTypes.length) {
    await loadAxisTypes();
  } else {
    loadAxisTypes();
  }
  await periodTypeStore.fetchPeriodTypes();
       await chartAccountStore.fetchChartAccounts(); 
 loadBalance();
 if (isEmpty(exercices.value)) await exerciceStore.getExercicesIdYear()
});

// watch(
//   () => chartAccountForm.value.exercice_id,
//   (newExerciceId) => {
//     fetchAvailableMonths(newExerciceId);
//     chartAccountForm.value.month = null;
//   }
// );

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
  if (statusCode === 200 || statusCode === 404) calculateAvailableMonthsLocally(exerciceId,data);
  // if (statusCode === 200) {
  //   disableInputMonth.value = true
  //   // chartAccountForm.value.month = data.latest_balance_sheet_head_month + 1;
  //   chartAccountForm.value.month = (data.latest_balance_sheet_head_month % 12) + 1;
  // } else 
  else if (statusCode === 400) {
    showSnackbar(t(data.message), { color: "error" });
    availableMonths.value = []
    disableInputMonth.value = true
  } else if (statusCode === 404) {
  } else {
    showSnackbar(t("try again in a few seconds") ,{ color: 'error' });
    availableMonths.value = []
  }
  if (statusCode === 200 || statusCode === 404) handleChangeMonth(chartAccountForm.value.month)
}

function calculateAvailableMonthsLocally(exerciceId,data=null) {

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
      year: current.getFullYear(),

      // disabled: (data && ((current.getMonth() + 1 <= data.latest_balance_sheet_head_month ) || (current.getFullYear() < data.latest_balance_sheet_head_year ))) ? true : false 
    });
    current.setMonth(current.getMonth() + 1);
  }

  availableMonths.value = months;
}



// function changeFilter(newFilters) {
//   // Merge new filters with existing filters
//   balanceStore.filter = { ...balanceStore.filter, ...newFilters };

//   const filteredValues = Object.fromEntries(
//     Object.entries(balanceStore.filter).filter(([key, value]) => value !== null && value !== "")
//   );


//   loadBalance();
// }

function changeFilter(...obj) {
  balanceStore.getBlances(...obj);
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
      scenario: chartAccountForm.value.scenario,
  };
  

  // const result =
  //   action.value === "add"
  //     ? await balanceStore.addBlance(balanceData)
  //     : await balanceStore.updateBalance(balanceData);
  const { data, statusCode } = action.value === "add" ? await balanceStore.addBlance(balanceData) : await balanceStore.updateBalance(balanceData);
console.log("data", data);

  if (statusCode == 201) {
    closeModal();
    loadBalance()
    showSnackbar(t("Balance created successfully"), {
      color: "success",
    });
    editBalance(data);
  } else if (statusCode == 400) {
    if (data.errors && Object.keys(data.errors).length > 0) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];

        showSnackbar(t(firstErrorMessage), { color: "error" });
      } else {
        showSnackbar(t(data.message), { color: "error" });
      }
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }

  // if (result.res) {
  //   closeModal();
  //   loadBalance()
  //  showSnackbar(t("Balance created successfully"), {
  //     color: "success",
  //   });
  //   editBalance(result?.data);
  // } else {
  //   errorMessages.value = result.error;
  // }
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





function viewBalance(item) {
  router.push({ name: "balance-details", params: { id: item.id }, query: { mode: 'view' } });


}
function editBalance(item) {
  router.push({ name: "balance-details", params: { id: item.id }, query: { mode: 'edit' } });
 
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
