<template>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isStandarSaving" @click="closeModal" />

 


    <!-- Dialog Content -->
    
  </VDialog>
   <VCard class="fixed-card" v-click-outside="() => (show = false)">
      <template #title>
        <!-- <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t("Balance") }}</span>
        </div> -->
      <!-- </template>
      <template #append v-if="!isLoading"> -->
        <!-- <VRow class="mt-1 d-flex justify-end gap-2 my-3"> -->
        <div class="d-md-flex justify-space-between align-center w-100">
          <div class="d-flex align-center flex-wrap">
            <span class="me-2">{{ $t("Balance") }}</span>
            
          </div>
          

          <div class="d-md-flex v-row" style="margin: 0; justify-content: end" v-if="!isLoading">
            
            <VBtn
          color="secondary"
          variant="tonal"
          class="me-2"
          @click="retourEtapePrécédente()"
        >
          <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
        </VBtn>
        
            <!-- <span v-if="!isViewMode && $can('balances.sendMail')"
            v-tooltip="$t('send-mail-balance')">
              <VBtn
                v-if="!isViewMode && $can('balances.sendMail')"
                @click="openModalSendingEmail()"
                color="primary"
                class="me-2"
              >
              <VIcon icon="tabler-mail" size="28" />
                </VBtn>
            </span> -->
            <!-- <span v-if="!isViewMode" v-tooltip="$t('productMd.attachments')">

            <VBtn
              color="info"
              :loading="isLoading"
              @click="openModalAttachments"
              class="me-2"
              v-if="!isViewMode"
            >
            <VIcon icon="tabler-file" size="28" />
            </VBtn>
  </span> -->
        
        <!-- <VBtn
          color="primary"
          :loading="isLoading"
          @click="submitForm"
          class="me-2"
          v-if="!isViewMode"
        >
          {{ $t("edit") }}
        </VBtn> -->

           <!-- <VBtn
         color="success" 
         :loading="isLoading"
          @click="terminateProvisionForBalance"
          class="me-2"
           v-if=" && form.flag_provision !== 1"
           >
          {{ $t("Valide") }}
       </VBtn> -->


  

<!-- <VBtn
  color="primary"
  class="me-2"
  v-if="traitementUsers.length"
  v-tooltip="`${$t('Traitement:')} ${traitementUsers.join(', ')}`"
>
  {{ $t("Person") }}
</VBtn>

<VBtn
  color="primary"
  class="me-2"
  v-if="validationUsers.length"
  v-tooltip="`${$t('Validation:')} ${validationUsers.join(', ')}`"
>
  {{ $t("People") }}
</VBtn>
 -->




 <!-- <span v-if="!isViewMode && form.flag_locked && $can('balances.destroy') && traitementAccess"

 v-tooltip="$t('delete_mode')">
        <VBtn
          color="error"
          v-if="!isViewMode && form.flag_locked && $can('balances.destroy') && traitementAccess"
          class="me-2"
          @click="showDeleteModePopUp = true"
        >
          <VIcon icon="tabler-trash" size="28" />
        </VBtn>
 </span> -->

 <!-- <span v-if="!isViewMode && $can('lockdowns.update') && form.flag_provision !== 1 && traitementAccess" 

 v-tooltip="form.is_locked ? $t('unlock') : $t('lock') ">



       
        <VBtn
          color="warning"
          v-if="!isViewMode && $can('lockdowns.update') && form.flag_provision !== 1 && traitementAccess"
          @click="handleBalanceLocking"
          class="me-2"
        >
          <div v-if="form.is_locked"  >
            <VIcon icon="tabler-lock-open-2" size="28" />
          </div>
          <div v-else>
            <VIcon icon="tabler-lock" size="28" />
          </div>
        </VBtn>
       </span> -->
        <!-- <VBtn
          v-if="form.is_locked && form.lockdown.user_id !== authUser.id"
          :disabled="true"
        >
          <VIcon icon="tabler-lock" size="28" class="me-1" />
          {{ $t("locked by") }} {{ form.lockdown?.locker_name }} {{ $t("at") }}
          {{ new Date(form.lockdown?.date_locked).toLocaleDateString("fr-FR") }}
        </VBtn> -->

        </div>
        
       
      </div>
      
      </template>
      <!-- </VRow> -->

      <VCardText>
        <div class="v-row">
          <!-- Label Field -->
          <div class="v-col-md-3 v-col-sm-4 v-col-xs-1 mb-1">
            <VTextField
              v-model="form.label"
              :label="t('Balance Label')"
              :placeholder="t('Balance Label')"
              :readonly="true"
            />
          </div>
          <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
            <VTextField
              v-model="form.reference"
              :label="t('Reference')"
              :placeholder="t('Reference')"
              :readonly="true"
            />
          </div>
          <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
             <VCombobox
              :label="$t('periodicity')"
              v-model="form.period_type_id"
              :placeholder="t('periodicity')"
              :items="periodTypes"
              item-value="id"
              item-title="label"
              readonly
            />
          </div>
  
          <div class="v-col-md-3 v-col-sm-4 v-col-xs-1 mb-1">
             <VCombobox
            :label="$t('accounting-plan')"
              v-model="form.chartaccount_id"
              :placeholder="t('accounting-plan')"
              :items="chartAccounts"
              item-value="id"
              item-title="label"
              readonly
            />
            
          </div>
          
          <div class="v-col-md-2 v-col-sm-4 v-col-xs-1 mb-1">
            <TooltipIcon
  v-if="traitementUsers.length"
   class="me-2 mx-2"
  :tooltip-text="
    `${$t('Traitement')} : ${traitementUsers.map((user)=> user.name).join(', ')}`
  "
  icon="tabler-users-group"
  color="primary"
/>



<TooltipIcon
 class="me-2 mx-2"
  v-if="validationUsers.length"
  :tooltip-text="
    `${$t('Validation')} : ${validationUsers.map((user)=> user.name).join(', ')}`
  "
  icon="tabler-user"
  color="primary"
/>
            <!-- <VBtn color="secondary" variant="tonal" @click="show = !show" class="mx-2">
              <VIcon
                :icon="show ? 'tabler-chevron-up' : 'tabler-chevron-down'"
                size="28"
              />
            </VBtn> -->
          </div>
  
        </div>
       
      </VCardText>
    </VCard>

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

  

  <VCard >
    
      <template #title>
        <!-- <div class="d-md-flex justify-space-between align-center w-100">
          <span>{{ t("Balance") }}</span>
        </div> -->
      <!-- </template>
      <template #append v-if="!isLoading"> -->
        <!-- <VRow class="mt-1 d-flex justify-end gap-2 my-3"> -->
        <div class="d-md-flex  align-center">
          <div class="d-flex align-center flex-wrap">
            <span class="me-2">{{ $t("Inter Company") }}</span>
</div>   
 <VChip v-if="form.status"
 class="me-2"

           
            :color="getStatusColor(form.status_intercompany)"
            :text-color="form.status_intercompany === 'validee' ? 'error' : 'red darken-2'"
            style="font-size: 18px;margin-left: 5em;"
          >
            {{ form.status_intercompany }}
          </VChip>

</div> 
 
</template>
<template #append>
 


     <VBtn
          class="me-2"
          color="primary"
          @click="exportData"
          :disabled="isDownloadingExport || interCompanies.length === 0"
          :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
          v-if="$can('inter.export')"
        >
          {{
            isDownloadingExport
              ? $t("exporting") + "..."
              : $t("ImportMd.Export")
          }}
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
      
       <VBtn
      variant="tonal"
      class="me-2"
      color="success"
      @click="openValidationDialog"
       v-if="$can('inter.valide') && form.status_intercompany
       !== 'Validé' "
      
    >
      <VIcon v-if="!isValidateInterCompany" class="tabler-checkbox" size="20"></VIcon> &nbsp;
      <span v-if="!isValidateInterCompany">{{ $t("Valider") }}</span>
      <VProgressCircular
        v-else
        indeterminate
        color="success"
        size="24"
      ></VProgressCircular>
    </VBtn>

    

     <VDialog v-model="isValidationDialogOpen" max-width="500">
  <VCard>
    <VCardTitle>{{ $t("Confirmation de Validation") }}</VCardTitle>
    <VCardText>
      {{ $t("Êtes-vous sûr de vouloir valider ce Inter Societe ?") }}
    </VCardText>
    <VCardText class="d-flex justify-end flex-wrap gap-3">

      <VBtn
        color="secondary" variant="tonal"
        @click="closeValidationDialog"
        :disabled="isValidateInterCompany"
      >
        {{ $t("Cancel") }}
      </VBtn>
      <VBtn
        :disabled="isValidateInterCompany"
        color="primary"
        @click="confirmValidation"
      >
      <VProgressCircular
        v-if="isValidateInterCompany"
        indeterminate
        color="primary"
        size="24"
      />
        {{ $t("Confirm") }}
      </VBtn>
    </VCardText>
  </VCard>
</VDialog>
  
      

      
     
    </template>

    
    <DataTableCore
      :headers="headers"
      :items="interCompanies"
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
    
      <template #item.account="{ item }">
        <div >
          {{ (item.account) }}
        </div>
      </template>
       <template
          v-for="header in dynamicHeaders"
          #[`item.${header.key}`]="{ item }"
          :key="header.key">
        <span v-tooltip="analyticalAxiesMap[item[header.key]]?.label || 'No label available'">
        {{  analyticalAxiesMap[item[header.key]]?.code || ''}}</span>
</template>
      <template #item.debit="{ item }">
        <div class="text-end" >
          {{ (item.debit) }}
        </div>
      </template>
      <template #item.credit="{ item }">
        <div  class="text-end" >
          {{ (item.credit) }}
        </div>
      </template>
   <template #item.company_id="{ item }">
  <VChip color="primary" class="ml-1">
    <span>
      {{ companies.find(comp => comp.id === item.company_id)?.label || 'N/A' }}
      
    </span>
  </VChip>
</template>

     
      
   <template #item.actions="{ item }">
    <div class="d-flex justify-end gap-3">
          <!-- <TooltipIcon
          v-if="$can('balances.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="viewBalance(item)"

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
import { useCoreStore, useChartAccountStore, useExerciceStore,useInterCompanyStore,useGroupsStore,useAuthStore } from '@/stores';
import { usePeriodTypeStore } from "@/stores/usePeriodTypeStore"; 
import { useBlanceStore } from "@/stores/useBalanceStore";


import { ref, computed, onMounted, inject,watch } from "vue";
import { useRouter,useRoute } from "vue-router";
import axios from 'axios';
import { getToken } from "@/services/JwtService";
import { isEmpty } from '@/@core/utils/helpers';
import { useAnalyticalAxiesStore,useAxisTypeStore,useCompanyStore } from "@/stores";


const IntercompanyStore = useInterCompanyStore();
const {
  interCompanies,
  total,
  filter,
  isSaving
} = storeToRefs(IntercompanyStore);
const form = ref({
  label: "",
  created_by: "",
  created_at: "",
  is_active: "",
});




const sendForm = ref(null)
const router = useRouter();
const route = useRoute();
const t = inject("t");
const companyStore = useCompanyStore(); 

const groupsStore = useGroupsStore();
const authStore = useAuthStore();

const { user: authUser } = storeToRefs(authStore);


const showSnackbar = inject("showSnackbar");
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const action = ref("");
const selectedItem = ref(null);
const  isLoading= ref(false);
const isDownloadingExport= ref(false);
const isImportDialogVisible = ref(false);
const showConfirmationValidateDialog= ref(false);

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
const AnalyticalAxiesStore = useAnalyticalAxiesStore();
const { AnalyticalAxies } = storeToRefs(AnalyticalAxiesStore);
const axisTypeLabels = ref([]);

const show = ref(false);
const balanceStore = useBlanceStore();
const total1 = ref(0)
const total2 = ref(0)
const total3 = ref(0)
const total4 = ref(0)
const isValidateInterCompany = ref(false)
const isValidationDialogOpen = ref(false); 
    const { companies } = storeToRefs(companyStore);



const closeValidationDialog = () => {
  isValidationDialogOpen.value = false;
};

const openValidationDialog = () => {
  isValidationDialogOpen.value = true;
};



// const balanceId = route.query.balance_id;
const { id } = route.params;


function retourEtapePrécédente() {
  router.back();
}
const traitementAccess = computed(() => {
  return traitementUsers.value.some((user) => user.id === authUser.value.id )
});

const ValidationAccess = computed(() => {
  return validationUsers.value.some((user) => user.id === authUser.value.id )
});


//  const traitementUsers = computed(() =>
//       groupsStore.traitementGroups
//         .filter((group) => group.intervention === "Traitement")
//         .flatMap((group) => group.users || [])
//         .map((user) => user)
//     );
//  const validationUsers = computed(() =>
//       groupsStore.traitementGroups
//         .filter((group) => group.intervention === "Validation")
//         .flatMap((group) => group.users || [])
//         .map((user) => user)
//     );
    
    async function exportData() {
  try {
    // isDownloadingExport.value = true;
    const axisTypesKeys = dynamicHeaders.value.map((header) => header.key);
    await IntercompanyStore.exportInterCompanyDetails({
      balance_id: id,
      axis_types: dynamicHeaders.value.map((header) =>
        JSON.stringify({
          key: header.key,
          title: header.title,
        })
           ),
       
    });
    showSnackbar(t("Export completed successfully"), { color: "success" });
  } catch (error) {
    console.error("Error exporting inter societe:", error);
    showSnackbar(t("Failed to export  inter societe"), { color: "error" });
  } finally {
    isDownloadingExport.value = false;
  }
}
    
 const traitementUsers = computed(() =>
       groupsStore.traitementGroupsInterCompany
        .filter((group) => group.intervention === "Traitement")
        .flatMap((group) => group.users || [])
        .map((user) => user)
    );

 const validationUsers = computed(() =>
      groupsStore.traitementGroupsInterCompany
        .filter((group) => group.intervention === "Validation")
        .flatMap((group) => group.users || [])
        .map((user) => user)
    );



const cachedAxisTypes = JSON.parse(localStorage.getItem("cachedAxisTypesInter")) || [];

const axisTypes = ref(cachedAxisTypes);

const loadAxisTypes = async () => {

  await axisTypeStore.getAxisTypes();
  if (axisTypeStore.axisTypes.length) {
    axisTypes.value = axisTypeStore.axisTypes;

    localStorage.setItem("cachedAxisTypesInter", JSON.stringify(axisTypeStore.axisTypes));
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
        case 'Validé':
            return 'success'; 
        default:
            return 'primary'; 
    }
};
const dynamicHeaders = computed(() =>
  axisTypes.value
    .filter((axis) => axis.is_active === "active")
    .map((axis) => ({
      title: axis.label,
      key: `axistype0${axis.id}_id`,
      id: axis.id,
      sortable: true,
      filterable: true,
      typefilter: "text",
    }))
);

const analyticalAxiesMap = computed(() => {
  const map = {};
  AnalyticalAxiesStore.AnalyticalAxies.forEach((axis) => {
    map[axis.id] = {
      id: axis.id,
      label: axis.label,
      code: axis.code,
    };
  });
  
  return map;
});



const headers = computed(() => [
  {
    title: t("N° compte"),
    key: "account",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
 

   ...dynamicHeaders.value,
 
  {
    title: t("Debit"),
    key: "debit",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
  {
    title: t("Credit"),
    key: "credit",
    sortable: true,
    filterable: true,
    filtervalue: "",
    typefilter: "range",
    isDouble: true,
  },
 
    { title: t("companies"), key: "company_id", sortable: true, filterable: true ,  typefilter: "text"},

 
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

// async function loadBalance() {
//   isLoading.value = true;
//   await balanceStore.getBlances();
//   isLoading.value = false;
// }
const loadInterCompanies = async (id) => {
  isLoading.value = true;
  await IntercompanyStore.getInterCompaniesDetails({balance_id: id});
    form.value = { ...IntercompanyStore.currentInterCompanybalance[0] };
    // console.log('')
      console.log('Form Data:', form);
  isLoading.value = false;
};

onBeforeUnmount(() => {
  IntercompanyStore.reset()
})

onMounted(async() => {
    loadInterCompanies(id)
  // if (!cachedAxisTypes.length) {
  //   await loadAxisTypes();
  // } else {
  //   loadAxisTypes();
  // }
    await companyStore.getOnlyActiveCompanies();

  await periodTypeStore.fetchPeriodTypes();
       await chartAccountStore.fetchChartAccounts(); 
        await AnalyticalAxiesStore.getAllAnalyticalAxies();
          await groupsStore.groupeTraitementInterCompany();


   await axisTypeStore.getAxisTypes();
   


   
 if (isEmpty(exercices.value)) await exerciceStore.getExercicesIdYear()
 
});

watch(
  () => chartAccountForm.value.exercice_id,
  (newExerciceId) => {
    fetchAvailableMonths(newExerciceId);
    chartAccountForm.value.month = null;
  }
);
const confirmValidation = async () => {
  isValidateInterCompany.value = true;
  try {
    const isSuccess = await IntercompanyStore.validateInterCompany( {balanceId: id});
    console.log('succ',isSuccess);
    
    if (isSuccess.success) {
      showSnackbar(t("CPC validé avec succès !"), { color: "success" });
      loadInterCompanies(id); 
    }
  } catch (error) {
    console.error("Erreur lors de la validation :", error);
    showSnackbar(t("Une erreur inattendue s'est produite."), { color: "error" });
  } finally {
    isValidateInterCompany.value = false;
    closeValidationDialog();
  }
};


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



// function changeFilter(newFilters) {
//   // Merge new filters with existing filters
//   balanceStore.filter = { ...balanceStore.filter, ...newFilters };

//   const filteredValues = Object.fromEntries(
//     Object.entries(balanceStore.filter).filter(([key, value]) => value !== null && value !== "")
//   );


//   loadBalance();
// }

function changeFilter(...obj) {
  IntercompanyStore.getInterCompaniesDetails(...obj);
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

async function updateBalance() {
  console.log({
    id: id,
    label: form.value.label,
    periedicity: form.value.period_type_id,
    chartaccount: form.value.chartaccount_id,
  })
  const result = await balanceStore.updateBalance({
    id: id,
    label: form.value.label,
    periedicity: form.value.period_type_id.id ?? form.value.period_type_id,
    chartaccount: form.value.chartaccount_id.id ?? form.value.chartaccount_id,
  });

}

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

const formattedTotalBgIni67 = computed({
  get() {
    return form.value.total_bg_ini67
      ? parseFloat(form.value.total_bg_ini67).toFixed(2)
      : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    form.value.total_bg_ini67 = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotalBgFinal67 = computed({
  get() {
    return form.value.total_bg_final67
      ? parseFloat(form.value.total_bg_final67).toFixed(2)
      : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    form.value.total_bg_final67 = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotalBgFinal = computed({
  get() {
    return form.value.total_bg_final
      ? parseFloat(form.value.total_bg_final).toFixed(2)
      : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    form.value.total_bg_final = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal1 = computed({
  get() {
    return total1.value ? parseFloat(total1.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total1.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal2 = computed({
  get() {
    return total2.value ? parseFloat(total2.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total2.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal3 = computed({
  get() {
    return total3.value ? parseFloat(total3.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total3.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});

const formattedTotal4 = computed({
  get() {
    return total4.value ? parseFloat(total4.value).toFixed(2) : "0.00";
  },
  set(value) {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    total4.value = isNaN(parsedValue) ? 0 : parsedValue.toFixed(2);
  },
});


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
    loadInterCompanies()
    loadBalanceData
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
