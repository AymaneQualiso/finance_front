<template>
  <VDialog
    v-model="insertBgConsolidesDialogShown"
    max-width="600"
    persistent
  >
    <DialogCloseBtn @click="closeInsertBgConsolidesModal" :disabled="isLoadingBgConsolide" />
    <VCard :title="$t('bgConsolides.create_bgConsolide')">
      <VCardText>
        <VForm ref="sendForm" >
          <VRow>
            <VCol cols="12" v-if="chartAccounts.length !== 1">
             <AppCombobox
                v-model="dataBgConsolide.chartaccount_id"
                :label="$t('accounts.chart_account')"
                :placeholder="$t('accounts.chart_account')"
                :items="chartAccounts"
                item-title="label"
                item-value="id"
                class="required"
                :return-object="false"
                :loading="isLoadingAccounts"
                :rules="[requiredValidator]"
                @update:model-value="(value) => { restoreDataBgConsolide() }"
              />
            </VCol>
            <VCol cols="12">
              <VSelect 
                v-model="dataBgConsolide.year"
                :placeholder="$t('year_exercice')"
                :label="$t('year_exercice')"
                :return-object="false"
                :items="yearRange"
                item-title="value"
                item-value="id"
                class="mt-2 required"
                :rules="[requiredValidator]"
                @update:model-value="(value) => { restoreDataBgConsolide() }"
                />
                <!-- @update:model-value="(value) => { calculateAvailableMonthsLocally(value)}" -->
                <!-- :items="exercices" -->
            </VCol>
            <VCol cols="12">
              <VSelect 
                :readonly="!dataBgConsolide.year || disableInputMonth"
                v-model="dataBgConsolide.month"
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
          <VCol cols="12">
            <VTable density="compact" style="display: block; max-height: 230px !important;overflow-y: auto;">
              <thead>
                <tr>
                  <th class="text-left">
                  </th>
                  <th class="text-center">
                    {{ t('etat_bilan') }}
                  </th>
                  <th class="text-center">
                    {{ t('etat_cpc') }}
                  </th>
                  <th class="text-center">
                    {{ t('action') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in companies"
                  :key="idx"
                >
                  <td>{{ item.company_label }}</td>
                  <td class="text-center" :class="statusCpcAndBilanColor(item.bilan_entete_status)">
                    {{ item.bilan_entete_status ?? t('not found') }}
                  </td>
                  <td class="text-center" :class="statusCpcAndBilanColor(item.cpc_entete_status)">
                    {{ item.cpc_entete_status ?? t('not found') }}
                  </td>
                  <td class="text-center">
                    <TooltipIcon           
                      :tooltip-text="$t('delete')"
                      icon="tabler-trash"
                      color="error"
                      @click="deleteItem(item.company_id)"
                    />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCol>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3" >
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="isLoadingBgConsolide"
          @click="closeInsertBgConsolidesModal"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="isLoadingBgConsolide"
          :disabled="isLoadingBgConsolide || isValidateCompanies"
          @click="submitInsertBgConsolideModal"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<script setup>
import { useBgConsolide } from "@/composables/bgConsolide.js";
import { computed } from "vue";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const {
  statusCpcAndBilanColor,
  isLoadingBgConsolide, 
  currentBgConsolide, 
  availableMonths,
  bgConsolidStore,
  chartAccounts,
  bgConsolides,
  companies,
  exercices,
  yearRange,
  sendForm,
  router,
  enums,
} = useBgConsolide(t, showSnackbar);

const emit = defineEmits(['update:isInsertBgConsolidesDialogShown']);
const insertBgConsolidesDialogShown = defineModel("isInsertBgConsolidesDialogShown", {
  type: Boolean,
  default: false,
});
const dataBgConsolide = defineModel("data", {
  type: Object,
  default: () => ({}),
});

function closeInsertBgConsolidesModal() {
  emit('update:isInsertBgConsolidesDialogShown', false);
  dataBgConsolide.value.month = null
  dataBgConsolide.value.chartaccount_id = null
  dataBgConsolide.value.year = null
  companies.value = [];
}

const isValidateCompanies = computed(() => {
  if (companies.value.length <= 1) {
    return true;
  }
  return companies.value.some((company) => {
    return company.cpc_entete_status == null || 
      company.cpc_entete_status == '' || 
      company.cpc_entete_status != enums.value.cpcStatus.VALIDEE || 
      company.bilan_entete_status == null ||
      company.bilan_entete_status == '' ||
      company.bilan_entete_status != enums.value.cpcStatus.VALIDEE 
  })
})



async function handleChangeMonth(value) {
  if (!value || !dataBgConsolide.value.year || !dataBgConsolide.value.chartaccount_id) {
    companies.value = []
    return;
  }

  const { data, statusCode } = await bgConsolidStore.getAllCompaniesByExercice(dataBgConsolide.value.year, value, dataBgConsolide.value.chartaccount_id);

  if (statusCode === 200) {
    companies.value = data
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }
}

function restoreDataBgConsolide() {
  if (dataBgConsolide.value.month && dataBgConsolide.value.year && dataBgConsolide.value.chartaccount_id) {
    handleChangeMonth(dataBgConsolide.value.month);
  } else {
    dataBgConsolide.value.month = null
    companies.value = [];
  }
}

function calculateAvailableMonthsLocally(exerciceId) {

  const selectedExercice = exercices.value.find(
    (ex) => ex.id === exerciceId
  );
  
  if (!selectedExercice) {
    dataBgConsolide.value.month = null
    dataBgConsolide.value.year = null
    availableMonths.value = [];
    companies.value = [];
    return;
  }

  dataBgConsolide.value.month = null

  dataBgConsolide.value.year = selectedExercice.year

  const start = new Date(selectedExercice.date_depart_exercice);
  const end = new Date(selectedExercice.date_fin_exercice);

  const months = [];
  let current = new Date(start);

  while (current <= end) {
    months.push({
      value: current.getMonth() + 1,
      label: current.toLocaleString("default", { month: "long" }) + '-' + current.getFullYear(),
      year: current.getFullYear()
    });
    current.setMonth(current.getMonth() + 1);
  }

  availableMonths.value = months;
}

function deleteItem(companyId) {
  const index = companies.value.findIndex((company) => company.company_id === companyId);
  if (index !== -1) {
    companies.value.splice(index, 1);
  } else {
    console.warn(`Company with ID ${companyId} not found.`);
  }
}

async function submitInsertBgConsolideModal() {
  sendForm.value.validate().then(async ({ valid }) => {
    if (!valid) return

    dataBgConsolide.value.companies = companies.value

    const { data, statusCode } = await bgConsolidStore.createBgConsolide(dataBgConsolide.value)

    if (statusCode === 201) {
      showSnackbar(t("Added ok", { model: t("bgConsolides.bgConsolide") }), { color: "success" });
      editBalance(data);
      dataBgConsolide.value = []
    } else if (statusCode === 422) {
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
  })
}

function editBalance(item) {
  router.push({ name: "balance-details", params: { id: item.id }, query: { mode: 'edit' } });
}
</script>
