<template>
  <VDialog v-model="isAddDialogOpen" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isCpcLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard :title="$t('cpc')" :loading="isCpcLoading" :disabled="isCpcLoading">
      <VCardText>
        <VForm ref="sendForm" >
        <VRow>
          <VCol cols="12">
            <AppCombobox
              v-model="cpcForm.balanceId"
              :label="$t('balances')"
              :placeholder="$t('balances')"
              :items="balanceHeads"
              item-title="label"
              item-value="id"
              :rules="[requiredValidator]"
              class="required"
              :return-object="false"
              :readonly="action === 'show'"
              clearable
              @update:model-value="changeCpcForm()"
            />
          </VCol>
        </VRow>

        <!-- New Scenario Combobox -->
        <VRow v-if="cpcForm.balanceId">
          <VCol cols="12">
            <VSelect
              v-model="cpcForm.scenario"
              :label="$t('scenario')"
              :placeholder="$t('scenario')"
              :items="getEnums(enums.scenarioBilan, t)"
              item-title="title"
              item-value="key"
              :rules="[requiredValidator]"
              class="required"
              :return-object="false"
              :readonly="action === 'show'"
              @update:model-value="
                (value) => {
                  checkScenario(value);
                }
              "
            />
          </VCol>
        </VRow>

        <!-- Conditional Year Reference -->
        <VRow v-if="cpcForm.scenario">
          <VCol cols="12">
            <VSelect
              v-model="cpcForm.yearReference"
              :label="$t('year_reference')"
              :placeholder="$t('year_reference')"
              :items="yearsReferenceData"
              item-title="label"
              item-value="value"
              :rules="[requiredValidator]"
              class="required"
              :return-object="false"
              :readonly="action === 'show'"
            />
          </VCol>
        </VRow>

        <VRow v-if="cpcForm.scenario && isBgConsolide">
          <VCol cols="12">
            <AppCombobox
              class="required"
              v-model="cpcForm.taux_is"
              suffix=" % "
              :label="$t('Taux IS')"
              :placeholder="$t('Taux IS (0-100)')"
              :rules="[requiredValidator, betweenValidator(cpcForm.taux_is, 0, 100)]"
            />
          </VCol>
        </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ t("Cancel") }}
        </VBtn>
        <VBtn @click="createCpcItem" v-if="action !== 'show'" :loading="isCpcLoading">
          {{ t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VCard :title="$t('CPC')" v-if="$can('cpc.index')">
    <!-- make create button -->
    <template #append>
      <VBtn color="primary" @click="openModal()" v-if="$can('cpc.store')">
        {{ $t("add") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="cpcItems"
      :total="total"
      :per_page="10"
      :is-loading="isLoadingCpcItems"
      :filter="filter"
      @change-filter="changeFilter"
      :page="page"
    >
      <template #item.status="{ item }">
        <VChip v-if="item.status" :color="getStatusColor(item.status)">
          {{ item.status }}
        </VChip>
      </template>
      <template #item.label="{ item }">
          <span v-tooltip="item.label">{{ item.label }}</span>
        </template>
      <template #item.balance_sheet_label="{ item }">
          <span v-tooltip="item.balance_sheet_label">{{ item.balance_sheet_label }}</span>
        </template>
      <template #item.flag_bg_consolide="{ item }">
        <VChip :color="getIsBgConsolideColor(item.flag_bg_consolide)">
          {{ item.flag_bg_consolide ? t('Yes') : t('non') }}
        </VChip>
      </template>
      <template #item.scenario="{ item }">
        {{ $t(`Enums.${item.scenario}`) }}
      </template>
      <template #item.year_reference="{ item }">
        <div class="d-flex justify-end">
          {{ item.year_reference }}
        </div>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('cpc.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="redirectToEdit(item.id)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useCpc } from "@/composables/cpc";
import { useRouter } from "vue-router";
import { useExerciceStore } from "@/stores/useExcerciceStore";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const router = useRouter();
const exerciceStore = useExerciceStore();

const {
  enums,
  headers,
  filter,
  total,
  selected,
  changeFilter,
  getData,
  isLoadingCpcItems,
  cpcItems,
  openModal,
  isAddDialogOpen,
  cpcForm,
  getAllBalanceHeads,
  balanceHeads,
  createCpcItem,
  closeModal,
  yearsReferenceData,
  isBgConsolide,
  sendForm,
  isCpcLoading,
  getIsBgConsolideColor,
} = useCpc(t, showSnackbar);

const redirectToEdit = (id) => {
  router.push({ name: "cpc-edit", params: { id } });
};
const getStatusColor = (status) => {
  switch (status) {
    case "Brouillon":
      return "grey";
    case "Validé":
      return "success";
    case "Clôturé":
      return "error";
    default:
      return "primary";
  }
};

const fetchYears = async (balanceId) => {
  if (!balanceId) return;
  await exerciceStore.getAllExercices();
  console.log("Exercices:", exerciceStore.exercices);
};

async function checkScenario(value) {
  cpcForm.value.yearReference = "";
  yearsReferenceData.value = [];

  if (!cpcForm.value.balanceId) {
    showSnackbar(t("select balance first!"), {
      color: "warning",
    });
    cpcForm.value.scenario = null;
    return;
  }

  switch (value) {
    case enums.value.scenarioBilan.DEFINITIVE:
      const balance = balanceHeads.value.find(
        (bal) => bal.id == cpcForm.value.balanceId
      );

      if (!balance) {
        showSnackbar(t("balance not found!"), { color: "warning" });
        break;
      }

      if (balance.flag_bg_consolide == true) {
        populateYearsReference();
        break;
      }

      if (!balance.exercice_n_1 || isEmpty(balance.exercice_n_1)) {
        showSnackbar(t("exercice n_1 empty in balance"), { color: "warning" });
        break;
      }

      cpcForm.value.yearReference = balance.exercice_n_1;
      break;

    case enums.value.scenarioBilan.SIMULATION:
      populateYearsReference();
      break;
    default:
      yearsReferenceData.value = [];
      break;
  }
}

function populateYearsReference() {
  const balance = balanceHeads.value.find(
    (bal) => bal.id == cpcForm.value.balanceId
  );

  const yearMatch = balance.year;
  if (!yearMatch) {
    console.error("Year not found in label:", balance.label);
    return [];
  }

  const extractedYear = parseInt(yearMatch, 10);
  const maxYearsBack = 5;

  yearsReferenceData.value = Array.from(
    { length: maxYearsBack },
    (_, index) => {
      const year = extractedYear - (index + 1);
      return { value: year, label: year.toString() };
    }
  );

  isBgConsolide.value = balance.flag_bg_consolide ? true : false;
}

function changeCpcForm() {
  cpcForm.value.scenario = "";
  cpcForm.value.yearReference = "";
  isBgConsolide.value = false;
}

// const filteredYears = computed(() => {
//   console.log("Selected Balance ID:", cpcForm.value.balanceId);

//   // Check if balanceId is selected
//   if (!cpcForm.value.balanceId) return [];

//   // Find the selected balance from balanceHeads
//   const selectedBalance = balanceHeads.value.find(
//     (balance) => balance.id === cpcForm.value.balanceId
//   );

//   if (!selectedBalance) {
//     console.log("No matching balance found for the selected Balance ID");
//     return [];
//   }

//   console.log("Selected Balance:", selectedBalance);

//   const filtered = exerciceStore.exercices
//     .filter((exercice) => exercice.id === selectedBalance.exercice_id)
//     .map((exercice) => exercice.year);

//   console.log("Filtered Exercise Years:", filtered);

//   if (filtered.length === 0) return [];

//   const selectedYear = Math.max(...filtered);

//   const pastYears =
//     selectedYear === 2024
//       ? Array.from({ length: 5 }, (_, index) => selectedYear - 1 - index)
//       : Array.from({ length: 5 }, (_, index) => selectedYear - index);

//   const dropdownYears = pastYears.map((year) => ({
//     label: year.toString(),
//     value: year.toString(),
//   }));

//   console.log("Dropdown Years:", dropdownYears);
//   return dropdownYears;
// });

watch(
  () => cpcForm.balanceId,
  async (newBalanceId) => {
    if (newBalanceId) {
      await fetchYears(newBalanceId);
    }
  }
);
onMounted(async () => {
  await exerciceStore.getAllExercices();

  await getData();
  await getAllBalanceHeads();
});
</script>
