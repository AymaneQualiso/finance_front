<template>
  <VCard
    v-if="$can('payment_delays.index')"
    :title="$t('Delai_de_paiement')"
  >
    <template #append>
      <VBtn
        color="primary" 
        :disabled="!paymentdelays.length || !selected.length"
        @click="openModal"
          v-if="$can('payment_delays.update')"
      >
        Mettre à jour
      </VBtn>
      <VBtn
        color="primary"
        class="mx-2"
        :loading="isLoadingPaymentdelay"
        :disabled="!paymentdelays.length || !selected.length"
        @click="exportExcel"
      >
      {{ $t("ImportMd.Export") }}
      </VBtn>
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="paymentdelays"
      :total="total"
      :per_page="50"
      :is-loading="isLoadingPaymentdelay"
      :filter="filter"
      :show-select="$can('payment_delays.export')"
      :page="page"
      :scrollTableWithFixedHeaderForPaymentDelay="true"
      :scrollTableHorizontalWithTwoFixedColumnInHeader="true"
      @change-filter="changeFilter"
    >
      <template #item.label="{ item }">
       
        <VTooltip>
          <template #activator="{ props }">
            <span
              v-bind="props"
              class="truncate"
              :title="item.label"
            >
              {{ item.label }}
            </span>
          </template>
          <span>{{ item.label }}</span>
        </VTooltip>
      </template>
      <template #item.bg_consolide_companies="">
        <div class="d-flex justify-start gap-3" />
      </template>
      <!--
        <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
        </template> 
      -->
      <template #item.invoice_amount_ttc="{ item }">
        <div class="text-end">
          {{ formatAmount(item.invoice_amount_ttc) }}
        </div>
      </template> 
      <template #item.amount_not_yet_paid="{ item }">
        <div class="text-end">
          {{ formatAmount(item.amount_not_yet_paid) }}
        </div>
      </template>
      <template #item.payment_delay="{ item }">
        <div class="text-end">
          {{ formatAmount(item.payment_delay) }}
        </div>
      </template>
      <template #item.hors_delai="{ item }">
        <div class="text-end">
          {{ formatAmount(item.hors_delai) }}
        </div>
      </template>
      <template #item.mnt_paye_horsdelai="{ item }">
        <div class="text-end">
          {{ formatAmount(item.mnt_paye_horsdelai) }}
        </div>
      </template>
      <template #item.date_liv_marchandise="{ item }">
        {{ formatDate(item.date_liv_marchandise) }}
      </template> 
      <template #item.date_emission="{ item }">
        {{ formatDate(item.date_emission) }}
      </template>
      <template #item.updated_at="{ item }">
        {{ formatDate(item.updated_at) }}
      </template>
      <template #item.date_prevpaiem="{ item }">
        {{ formatDate(item.date_prevpaiem) }}
      </template> 
      <template #item.date_releve="{ item }">
        {{ formatDate(item.date_releve) }}
      </template>
      <template #item.date_paiement_hors_delai="{ item }">
        {{ formatDate(item.date_paiement_hors_delai) }}
      </template>
      <template #item.date_creation="{ item }">
        {{ formatDate(item.date_creation) }}
      </template>
      <template #item.statut="{ item }">
        <VChip :color="getIsBgPaymentDelayColor(item.statut)">
          {{ item.statut }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="openModal(item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>

  <VDialog
    v-model="isUpdateModalOpen"
    max-width="600px"
  >
    <VCard>
      <VCardTitle>
        {{ $t('update_delay_payment') }}
      </VCardTitle>

      <VCardText>
        <VForm ref="formElt">
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="updateForm.statut"
                :items="statusOptions"
                item-title="text"
                item-value="text"
                :return-object="false"
                :label="$t('Status')"
                outlined
                class="required"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>

          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="updateForm.observation"
                :label="$t('Observation')"
                outlined
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="updateForm.nature_obs_id"
                :items="natureOptions"
                item-title="name"
                item-value="id"
                :return-object="false"
                :label="$t('Nature')"
                outlined
                clearable
                class="required"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
     
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="isUpdateModalOpen = false"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="isLoadingPaymentdelay"
          @click="updateSelectedRecords">
          {{ $t('Update') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { onMounted, ref, reactive, inject ,watch } from "vue";
import { usePaymentDelay } from "@/composables/paymentDelay.js";
import { useRoute } from 'vue-router';

// Existing injections and composable methods
const showSnackbar = inject("showSnackbar");
const t = inject("t");
const formElt = ref();
const route = useRoute();

const {
  router,
  selected,
  headers,
  isLoadingPaymentdelay,
  
  paymentdelays,
  total,
  filter,
  natureOptions,
  changeFilter,
  getData,
  updateRecords,
  fetchNatureObsOptions,
  exportExcel,
  getIsBgPaymentDelayColor,
  // formatAmount,
} = usePaymentDelay(t, showSnackbar);

// Modal state and form data
const isUpdateModalOpen = ref(false);

const updateForm = reactive({
  id: null, 
  statut: "",
  observation: "",
  nature_obs_id: null,
});

// Example nature options (could also come from an API)
// const natureOptions = ref([
//   { id: 1, name: "Nature 1" },
//   { id: 2, name: "Nature 2" },
//   { id: 3, name: "Nature 3" },
// ]);

const statusOptions = [
  { value: 1, text: "Non traité" },
  { value: 2, text: "En cours" },
  { value: 3, text: "Traité" },
];


const openModal = (item = null) => {
  if (item) {
    updateForm.id = item.id || null; 
    updateForm.statut = item.statut || ""; 
    updateForm.observation = item.obs || "";
    updateForm.nature_obs_id = item.nature_obs_id || null;
  } else {
    updateForm.id = null;
    updateForm.statut = "";
    updateForm.observation = "";
    updateForm.nature_obs_id = null;
  }

  isUpdateModalOpen.value = true;
};

const formatAmount = amount => {
  return amount ? (new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(amount)) : "0,00"
};


// Function to update selected records
const updateSelectedRecords = async () => {
  const { valid } = await formElt.value.validate();
  if (!valid) return;

  const ids = Array.from(selected.value); // Get selected IDs
  if (ids.length === 0 && !updateForm.id) {
    showSnackbar('No records selected or no record being edited.', 'warning');
    return;
  }

  // Prepare payload
  const payload = {
    statut: updateForm.statut,
    observation: updateForm.observation,
    nature_obs_id: updateForm.nature_obs_id,
    ids: ids.length > 0 ? ids : [updateForm.id],  // Either selected or single record ID
  };

  try {
    await updateRecords(payload);
    await getData(route.name);
    selected.value = [];
    updateForm.statut = "";
    updateForm.observation = "";
    updateForm.nature_obs_id = null;

    isUpdateModalOpen.value = false;
    showSnackbar(t("Updated ok", { model: t("Delai_de_paiement") }), { color: "success" });
  } catch (error) {
    showSnackbar(t("An error occurred while updating. Please try again."), {
      color: "error",
    });
  }
};


onMounted(async () => {

  await getData(route.name);
  await fetchNatureObsOptions();
});

watch(route, async () => {
  console.log('route', route);
  
  await getData(route.name);
});
</script>

<!--
  <script setup>
  import { useBgConsolide } from "@/composables/paymentDelay.js";
  import { onMounted } from "vue";

  const showSnackbar = inject?("showSnackbar");
  const t = inject("t");
  const {
  router,
  selected,
  headers,
  isInsertbgConsolidesDialogShown,
  isExportingBgConsolide, 
  isLoadingBgConsolide, 
  currentBgConsolide, 
  bgConsolides,
  paymentdelays,
  chartAccounts,
  total, 
  filter,
  openModal,
  changeFilter,
  getData
  } = useBgConsolide(t, showSnackbar);

  onMounted(async () => {
  await getData();
  });
  </script> 
-->
