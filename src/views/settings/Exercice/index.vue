<template>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <DialogCloseBtn :disabled="isSaving" @click="closeModal" />

    <VCard :title="dialogTitle" :loading="isSaving">
      <VCardText>
        <VForm ref="exerciseFormRef" :readonly="modeReadOnly">
          <div v-if="exerciseForm.id">
            <VRow>
              <VCol cols="12">
                <VSelect
                  v-model="exerciseForm.year"
                  :items="availableYearcurrent"
                  item-value="value"
                  class="mt-2 required"
                  item-title="label"
                  :label="$t('Exercice')"
                  :return-object="false"
                  :rules="[requiredValidator]"
                  :readonly="exerciseForm.balance_sheet_heads_count>0"

                  @update:model-value="(value) => { resetDateDepartAndDateFin(value)}"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <AppTextField
                  v-model="formattedDateDepartExercice"
                  type="date"
                  :label="$t('Date Départ Exercice')"
                  class="mt-2 required"
                  :placeholder="$t('Date Départ Exercice')"
                  :min="`${exerciseForm.year}-01-01`"
                  :max="`${exerciseForm.year}-12-31`"
                  @blur="validateDate('date_depart_exercice')"
                  :rules="[requiredValidator]"
                  :disabled="!exerciseForm.year"
                  :readonly="exerciseForm.balance_sheet_heads_count>0"
                />
                  <!-- :config="{ dateFormat: 'd/m/Y' }" -->
              </VCol>
              <VCol cols="6">
                <AppTextField
                  v-model="exerciseForm.date_fin_exercice"
                  :label="$t('Date Fin Exercice')"
                  :rules="[requiredValidator]"
                  class="mt-2 required"
                  type="date"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <AppCombobox
                  v-model="exerciseForm.exercice_n_1"
                  :items="availableYears"
                  item-value="value"
                  class="mt-2 required"
                  item-title="label"
                  :label="$t('Exercice n-1')"
                  :return-object="false"
                  :rules="[requiredValidator]"
                  :disabled="!exerciseForm.year"
                  :readonly="exerciseForm.balance_sheet_heads_count>0"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <AppCombobox
                  v-model="exerciseForm.company_id"
                  :label="$t('companies')"
                  class="mt-2 required"
                  :placeholder="$t('companies')"
                  :items="companies"
                  item-title="label"
                  item-value="id"
                  :return-object="false"
                  :rules="[requiredValidator]"
                  :disabled="!exerciseForm.year"
                  :readonly="exerciseForm.balance_sheet_heads_count>0"
                />
              </VCol>
            </VRow>

            <!-- Société -->

            <!-- Taux IS -->
            <VRow>
              <VCol cols="6">
                <AppTextField
                  class="required"
                  v-model="exerciseForm.taux_is"
                  suffix=" % "
                  :label="$t('Taux IS')"
                  :placeholder="$t('Taux IS (0-100)')"
                  :rules="[percentageValidator]"
                  :disabled="!exerciseForm.year"
                />
              </VCol>

              <VCol cols="6">
                <AppCombobox
                  v-model="exerciseForm.status"
                  :items="getEnums(enums.exerciceStatus, $t)"
                  item-title="title"
                  item-value="key"
                  class="required"
                  :label="$t('Status')"
                  :return-object="false"
                  :rules="[requiredValidator]"
                  :readonly="exerciseForm.balance_sheet_heads_count>0"
                />
              </VCol>
            </VRow>
          </div>
          <div v-else>
            <!-- Date Départ Exercice -->
  
            <VRow>
              <VCol cols="12">
                <AppCombobox
                  v-model="exerciseForm.year"
                  :items="availableYearcurrent"
                  item-value="value"
                  class="mt-2 required"
                  item-title="label"
                  :label="$t('Exercice')"
                  :return-object="false"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="exerciseForm.date_depart_exercice"
                  type="date"
                  :label="$t('Date Départ Exercice')"
                  class="mt-2 required"
                  :placeholder="$t('Date Départ Exercice')"
                  :min="`${exerciseForm.year}-01-01`"
                  :max="`${exerciseForm.year}-12-31`"
                  @blur="validateDate('date_depart_exercice')"
                  :rules="[requiredValidator]"
                  :disabled="!exerciseForm.year"
                />
              </VCol>
            </VRow>
  
            <!-- Exercice n-1 -->
            <VRow>
              <VCol cols="12">
                <AppCombobox
                  v-model="exerciseForm.exercice_n_1"
                  :items="availableYears"
                  item-value="value"
                  class="mt-2 required"
                  item-title="label"
                  :label="$t('Exercice n-1')"
                  :return-object="false"
                  :rules="[requiredValidator]"
                  :disabled="!exerciseForm.year"
                />
              </VCol>
            </VRow>
  
            <!-- Société -->
            <VRow>
              <VCol cols="12">
                <AppCombobox
                  v-model="exerciseForm.company"
                  :label="$t('companies')"
                  class="mt-2 required"
                  :placeholder="$t('companies')"
                  :items="companies"
                  item-title="label"
                  item-value="id"
                  :return-object="false"
                  :rules="[requiredValidator]"
                  :disabled="!exerciseForm.year"
                />
              </VCol>
            </VRow>
  
            <!-- Taux IS -->
            <VRow>
              <VCol cols="12">
                <AppTextField
                  class="required"
                  v-model="exerciseForm.taux_is"
                  suffix=" % "
                  :label="$t('Taux IS')"
                  :placeholder="$t('Taux IS (0-100)')"
                  :rules="[percentageValidator]"
                  :disabled="!exerciseForm.year"
                />
              </VCol>
            </VRow>
          </div>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn @click="submitExercise" :loading="isSaving">
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Delete Confirmation Dialog -->
  <VDialog v-model="isDeleteDialogVisible" max-width="400">
    <VCard>
      <VCardTitle>{{ $t("Confirm") }}</VCardTitle>
      <VCardText>{{
        $t("Are you sure you want to delete this exercise?")
      }}</VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isDeleteDialogVisible = false"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn color="error" @click="confirmDelete">
          {{ $t("Delete") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog v-model="isViewDialogVisible" max-width="600">
    <DialogCloseBtn :disabled="isSaving" @click="closeModal" />

    <VCard>
      <VCardTitle>
        {{ $t("Exercice Details") }}
        <VSpacer />
      </VCardTitle>

      <VCardText>
        <VForm>
          <VRow>
            <VCol cols="12">
              <AppTextField
                :value="selectedExercice.year"
                :label="$t('Exercice')"
                readonly
                />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <AppTextField
                :value="formatDate(selectedExercice.date_depart_exercice)"
                :label="$t('Date Départ Exercice')"
                readonly
                />
            </VCol>
            <VCol cols="6">
              <AppTextField
                :value="formatDate(selectedExercice.date_fin_exercice)"
                :label="$t('Date Fin Exercice')"
                readonly
                />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppTextField
                :value="selectedExercice.exercice_n_1"
                :label="$t('exercice_n_1')"
                readonly
                />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppTextField
                :value="
                  companies.find(
                    (comp) => comp.id === selectedExercice.company_id
                  )?.label
                "
                :label="$t('companies')"
                readonly
                />
            </VCol>
          </VRow>

          <!-- Société -->

          <!-- Taux IS -->
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="selectedExercice.taux_is"
                :label="$t('Taux IS')"
                :suffix="'%'"
                readonly
                />
            </VCol>
          </VRow>

          <!-- Status -->
          <VRow>
            <VCol cols="12">
              <AppTextField
                :value="$t('Enums.' + selectedExercice.status)"
                :label="$t('Status')"
                readonly
                />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Exercise List -->
  <VCard :title="$t('Exercices')">
    <template #append>
      <VBtn
        class="me-2"
        color="primary"
        @click="openModal('add')"
        v-if="$can('Exercices.store')"
      >
        {{ $t("Add") }}
      </VBtn>
    </template>

    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="exercices"
      :total="total"
      :per_page="10"
      :is-loading="isLoading"
      :filter="filter"
      @change-filter="changeFilter"
    >
      <template #item.year="{ item }">
        <div class="d-flex justify-end">
          {{ item.year }}
        </div>
      </template>
      <template #item.exercice_n_1="{ item }">
        <div class="d-flex justify-end">
          {{ item.exercice_n_1 }}
        </div>
      </template>
      <template #item.date_depart_exercice="{ item }">
        <div>
          {{ formatDate(item.date_depart_exercice) }}
        </div>
      </template>
      <template #item.date_fin_exercice="{ item }">
        <div>
          {{ formatDate(item.date_fin_exercice) }}
        </div>
      </template>
      <template #item.company_id="{ item }">
        <!-- <VChip
          v-for="(company, index) in item.companies.slice(0, 2)"
          :key="company.id"
          color="primary"
          class="me-1"
        >
          <span>
            {{ company.label }}
          </span>
        </VChip> -->
        <VChip color="primary" class="ml-1">
          <span>
            {{ companies.find((comp) => comp.id === item.company_id)?.label }}
          </span>
        </VChip>
      </template>
      <template #item.status="{ item }">
        <StatusChip :title="item.status" />
      </template>

      <template #item.taux_is="{ item }">
        <div class="d-flex justify-end">{{ item.taux_is }}%</div>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <!-- View Tooltip Icon -->
          <TooltipIcon
            v-if="$can('exercices.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="viewExercise(item)"
          />
          <TooltipIcon
            v-if="$can('exercices.update') && item.status === 'ouvert'"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="editExercice(item)"
          />
          <TooltipIcon
            v-if="$can('exercices.update') && item.status === 'ouvert'"
            color="error"
            :tooltip-text="$t('closed')"
            icon="tabler-lock"
            @click="confirmToggleCloture(item)"
          />

          <VDialog
            v-model="isConfirmationDialogVisible"
            persistent
            max-width="500"
          >
            <VCard>
              <VCardTitle>{{ $t("Confirmation") }}</VCardTitle>
              <VCardText>{{
                $t("Êtes-vous sûr de vouloir clôturer ce exercice ?")
              }}</VCardText>
              <VCardText class="text-error">{{
                $t(
                  "NB : La clôture de cet exercice entraînera également la clôture de toutes les balances, CPC, bilans et flux de trésorerie associés."
                )
              }}</VCardText>

              <VCardActions>
                <VSpacer />
                <VBtn
                  variant="elevated"
                  color="secondary"
                  @click="isConfirmationDialogVisible = false"
                  :disabled="Loading"
                >
                  {{ $t("Cancel") }}
                </VBtn>
                <VBtn
                  color="primary"
                  variant="elevated"
                  @click="toggleCloture"
                  :loading="isLoading"
                >
                  {{ $t("Confirm") }}
                </VBtn>
              </VCardActions>
            </VCard>
          </VDialog>
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useExerciceStore } from "@/stores/useExcerciceStore";
import { useCompanyStore, useCoreStore } from "@/stores";

const exerciseStore = useExerciceStore();
const companyStore = useCompanyStore();
const isLoading = ref(false);

const { exercices, total, filter, isSaving } = storeToRefs(exerciseStore);

const t = inject("t");
const showSnackbar = inject("showSnackbar");
const isDialogVisible = ref(false);
const isDeleteDialogVisible = ref(false);
const isConfirmationDialogVisible = ref(false);
const action = ref("");
const selectedItem = ref(null);
const Loading = ref(false);
const currentYear = new Date().getFullYear();
const { companies } = storeToRefs(companyStore);
const isViewDialogVisible = ref(false);
const selectedExercice = ref({});
const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);
const modeReadOnly = ref(false);
const lastValidDate = ref(null);
const previousYear = ref(null);
const originalExerciceEdit = ref({})
const exerciseForm = ref({
  date_depart_exercice: "",
  exercice_n_1: "",
  company: "",
  taux_is: "",
  year: "",
});

function confirmToggleCloture(item) {
  selectedItem.value = item;
  isConfirmationDialogVisible.value = true;
}

function percentageValidator(value) {
  if (value < 1 || value > 100) {
    return t("Le pourcentage doit être compris entre 1 et 100");
  }
  return true;
}

const dialogTitle = computed(() => {
  return action.value === "add"
    ? t("Ajouter un nouvel exercice")
    : t("Modifier l'exercice");
});

const headers = ref([
  {
    title: t("Exercice"),
    key: "year",
    sortable: true,
    filterable: true,
    typefilter: "range",
  },

  {
    title: t("Date Départ"),
    key: "date_depart_exercice",
    sortable: true,
    filterable: true,
    typefilter: "date",
  },
  {
    title: t("Date Fin"),
    key: "date_fin_exercice",
    sortable: true,
    filterable: true,
    typefilter: "date",
  },
  {
    title: t("exercice_n_1"),
    key: "exercice_n_1",
    sortable: true,
    filterable: true,
    typefilter: "range",
  },
  {
    title: t("companies"),
    key: "company_id",
    sortable: true,
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("status"),
    sortable: true,
    key: "status",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.exerciceStatus, t),
  },

  {
    title: t("Taux IS"),
    key: "taux_is",
    sortable: true,
    filterable: true,
    typefilter: "range",
  },
  { title: "", key: "actions", sortable: false },
]);

onMounted(async () => {
  await loadExercises();
  await companyStore.getOnlyActiveCompanies();
});

async function loadExercises() {
  isLoading.value = true;
  await exerciseStore.getExercices();
  isLoading.value = false;
}

function closeModal() {
  isDialogVisible.value = false;
  isViewDialogVisible.value = false;
}

function showDeleteDialog(item) {
  selectedItem.value = item;
  isDeleteDialogVisible.value = true;
}

const dateRange = ref({
  min: `${exerciseForm.value.selectedYear}-01-01`,
  max: `${exerciseForm.value.selectedYear}-12-31`,
});

function viewExercise(item) {
  selectedExercice.value = item;
  isViewDialogVisible.value = true;
  modeReadOnly.value = true;
}

function editExercice(item) {
  console.log("edit", item.date_depart_exercice);
  
  exerciseForm.value = { ...item };
  originalExerciceEdit.value = { ...item }
  lastValidDate.value = item.date_depart_exercice;
  previousYear.value = item.year;
  isDialogVisible.value = true;
  modeReadOnly.value = false;
  action.value = "edit"
}

const exerciseFormRef = ref(null);

function validateDate(field) {
  if (!exerciseForm.value[field]) {
    showSnackbar(t("Veuillez sélectionner une date valide"), {
      color: "warning",
    });
  }
}

watch(() => exerciseForm.value.date_depart_exercice, (newValue, oldValue) => {
  if (action.value == 'edit') {    
    const minDate = `${exerciseForm.value.year}-01-01`;
    const maxDate = `${exerciseForm.value.year}-12-31`;
  
    if (!newValue) {
      lastValidDate.value = null;
      return;
    }
  
    if (newValue >= minDate && newValue <= maxDate) {
      lastValidDate.value = newValue;
      const startDate = new Date(newValue);
      startDate.setMonth(startDate.getMonth() + 12);
      exerciseForm.value.date_fin_exercice = startDate.toISOString().split("T")[0];
    } else {
      showSnackbar(t("Veuillez sélectionner une date valide"), { color: "warning" });
      exerciseForm.value.date_depart_exercice = lastValidDate.value ?? null;
    }
  }
});

const formattedDateDepartExercice = computed({
  get: () => exerciseForm.value.date_depart_exercice?.split("T")[0] ?? "", // Show only YYYY-MM-DD
  set: (newValue) => {
    if (!newValue) {
      exerciseForm.value.date_depart_exercice = null;
      return;
    }

    exerciseForm.value.date_depart_exercice = newValue;
  },
});

function resetDateDepartAndDateFin(value) {

  if (exerciseForm.value.year != originalExerciceEdit.value.year) {
    // exerciseForm.value.year = value;
    exerciseForm.value.date_depart_exercice = null;
    exerciseForm.value.date_fin_exercice = null;
  } else {
    exerciseForm.value.date_depart_exercice = originalExerciceEdit.value.date_depart_exercice;
    exerciseForm.value.date_fin_exercice = originalExerciceEdit.value.date_fin_exercice;
  }
  
}

function validateNumber(field) {
  const value = parseFloat(exerciseForm.value[field]);
  if (isNaN(value) || value <= 0) {
    showSnackbar(t("Veuillez entrer un nombre positif valide"), {
      color: "warning",
    });
    exerciseForm.value[field] = 0; // Reset to 0 if invalid
  }
}

// async function toggleCloture(item) {
//   const newStatus = item.statut === "ouvert" ? "clôture" : "ouvert";
//   const result = await exerciseStore.clotureExercise(item.id, newStatus);

//   if (result.success) {
//     showSnackbar(t("Statut mis à jour avec succès"), { color: "success" });
//     loadExercises();
//   } else {
//     showSnackbar(t("Échec de la mise à jour du statut"), { color: "error" });
//   }
//     isConfirmationDialogVisible.value
//      = false;

async function toggleCloture() {
  if (selectedItem.value) {
    isLoading.value = true; // Start loader
    const newStatus =
      selectedItem.value.status === "ouvert" ? "cloture" : "ouvert";

    try {
      const result = await exerciseStore.clotureExercise(
        selectedItem.value.id,
        newStatus
      );
      if (result.success) {
        showSnackbar(t("Exercice clôturé avec succès."), { color: "success" });
        await loadExercises();
      } else {
        showSnackbar(t("Échec de clôturer l`'exercice."), { color: "error" });
      }
    } catch (error) {
      showSnackbar(t("Échec de clôturer l`'exercice."), { color: "error" });
    } finally {
      isLoading.value = false; // Stop loader
      isConfirmationDialogVisible.value = false;
    }
  }
}

function openModal(actionName, item = {}) {
  action.value = actionName;
  exerciseForm.value = {
    year: "",
    date_depart_exercice: "",
    exercice_n_1: "",
    company: "",
    taux_is: "",
    ...item, // Pre-fill values if editingg
  };
  isDialogVisible.value = true;
}

// const availablesYears = computed(() => {
//   return Array.from({ length: 5 }, (_, i) => {
//     const year = exerciseForm.year - (i + 1);
//     return { value: year, label: `${year}` };
//   });
// });

const availableYears = computed(() => {
  return Array.from({ length: 5 }, (_, i) => {
    const year = exerciseForm.value.year - (i + 1);
    return { value: year, label: `${year}` };
  });
});

const availableYearcurrent = computed(() => {
  const years = [
    currentYear,
    currentYear + 1,
    currentYear - 1,
    currentYear - 2,
  ];

  return years.map((year) => ({ label: year.toString(), value: year }));
});

// function changeFilter(newFilters) {
//   exerciseStore.filter = { ...exerciseStore.filter, ...newFilters };

//   const filteredValues = Object.fromEntries(
//     Object.entries(exerciseStore.filter).filter(([key, value]) => value !== null && value !== "")
//   );

//   loadExercises();
// }

function changeFilter(...obj) {
  exerciseStore.getExercices(...obj);
}

async function submitExercise() {
  // if (exerciseFormRef.value.validate()) {
  exerciseFormRef.value.validate().then(async ({ valid }) => {
    if (!valid) return;
    try {
      let response;

      if (action.value === "add") {
        response = await exerciseStore.addExercice(exerciseForm.value);
      } else {
        response = await exerciseStore.updateExercice(exerciseForm.value);
      }
console.log("resp", response);

      if (response.success) {
        // showSnackbar(
        //   response.message || t("Exercice ajouté/modifié avec succès"),
        //   { color: "success" }
        // );
        showSnackbar(response.data.id ? t("Updated ok", { model: t("exercice") }) : t("Added ok", { model: t("exercice") }), { color: "success" });
        closeModal();
        loadExercises();
      } else {
        showSnackbar(response.message || t("try again in a few seconds"), {
          color: "error",
        });
      }
    } catch (error) {
      showSnackbar(error.message || t("try again in a few seconds"), {
        color: "error",
      });
    }
  });
  // else {
  //   showSnackbar(t('Veuillez corriger les erreurs dans le formulaire'), { color: 'error' });
  // }
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
