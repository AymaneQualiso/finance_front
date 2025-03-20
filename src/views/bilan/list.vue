<template>
  <VDialog v-model="isAddDialogOpen" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isBilanLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t('bilan')"
      :loading="isBilanLoading"
      :disabled="isBilanLoading"
    >
      <VCardText>
        <VForm ref="sendForm">
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="bilanForm.balanceId"
                :label="$t('balances')"
                :placeholder="$t('balances')"
                :items="balanceHeads"
                item-title="label"
                item-value="id"
                :rules="[requiredValidator]"
                class="mt-2 required"
                :return-object="false"
                :readonly="action === 'show'"
                @update:model-value="changeBilanForm()"
              />
            </VCol>
          </VRow>
          <VRow v-if="bilanForm.balanceId">
            <VCol>
              <VSelect
                v-model="bilanForm.scenario"
                :items="getEnums(enums.scenarioBilan, t)"
                :label="$t('scenario')"
                :placeholder="$t('scenario')"
                :rules="[requiredValidator]"
                item-title="title"
                item-value="key"
                :return-object="false"
                class="required"
                :readonly="
                  !getEnums(enums.scenarioBilan, t)?.length || action === 'show'
                "
                @update:model-value="
                  (value) => {
                    checkScenario(value);
                  }
                "
              />
            </VCol>
          </VRow>
          <VRow v-if="bilanForm.scenario">
            <VCol>
              <VSelect
                v-model="bilanForm.year_reference"
                :items="yearsReferenceData"
                :label="$t('year_reference')"
                :placeholder="$t('year_reference')"
                :rules="[requiredValidator]"
                item-title="title"
                item-value="key"
                :return-object="false"
                class="required"
              
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ t("Cancel") }}
        </VBtn>
        <VBtn @click="createBilanItem" v-if="action !== 'show'">
          {{ t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VCard :title="$t('bilan')" v-if="$can('bilan.index')">
    <!-- make create button -->
    <template #append>
      <VBtn color="primary" @click="openModal()" v-if="$can('bilan.store')">
        {{ $t("add") }}
      </VBtn>
    </template>

    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="bilanItems"
      :total="total"
      :per_page="10"
      :is-loading="isLoadingBilanItems"
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
            v-if="$can('bilan.update')"
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
import { useBilan } from "@/composables/bilan";
import { useRouter } from "vue-router";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const router = useRouter();

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

const {
  sendForm,
  enums,
  yearsReferenceData,
  headers,
  filter,
  total,
  selected,
  changeFilter,
  getData,
  isLoadingBilanItems,
  bilanItems,
  openModal,
  isAddDialogOpen,
  bilanForm,
  getAllBalanceHeads,
  balanceHeads,
  createBilanItem,
  closeModal,
  checkScenario,
  getIsBgConsolideColor,
} = useBilan(t, showSnackbar);

const redirectToEdit = (id) => {
  router.push({ name: "bilan-edit", params: { id } });
};

function changeBilanForm() {
  bilanForm.value.scenario = "";
  bilanForm.value.yearReference = "";
}

onMounted(async () => {
  await getData();
  await getAllBalanceHeads();
});
</script>
