<template>
  <VDialog v-model="isDialogVisible" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isChartAccountLoading" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t(dialogTitle)"
      :loading="isChartAccountLoading"
      :disabled="isChartAccountLoading"
    >
      <VCardText>
        <VForm ref="form">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="chartAccountForm.label"
                :label="$t('label')"
                :placeholder="$t('label')"
                clearable
                :error-messages="errorMessages.label"
                :rules="[requiredValidator]"
                class="mt-2 required"
              />
              <AppTextField
                v-model="chartAccountForm.abv"
                :label="$t('abv')"
                :placeholder="$t('abv')"
                maxLength="3"
                clearable
                :error-messages="errorMessages.abv"
                :rules="[requiredValidator]"
                class="mt-2 required"
              />

              <AppCombobox
                v-model="chartAccountForm.company"
                :label="$t('companies')"
                class="mt-2 required"
                :placeholder="$t('companies')"
                chips
                multiple
                :items="companies"
                item-title="label"
                item-value="id"
                :return-object="false"
                :rules="[requiredValidator]"
              />

              

              <AppCombobox
                v-model="chartAccountForm.is_active"
                :label="$t('is_active')"
                :placeholder="$t('is_active')"
                :items="getEnums(enums.isActive, $t)"
                item-title="title"
                item-value="key"
                class="mt-2 required"
                :return-object="false"
              />
              <AppCombobox
                v-model="chartAccountForm.locked"
                :label="$t('locked')"
                :placeholder="$t('locked')"
                :items="[
                  { key: true, title: $t('oui') },
                  { key: false, title: $t('non') },
                ]"
                item-title="title"
                item-value="key"
                class="mt-2 required"
                :return-object="false"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ t("Cancel") }}
        </VBtn>
        <VBtn @click="SubmitEvent"> {{ t("Confirm") }} </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard
    class=""
    :title="$t('accounting-plan')"
    v-if="$can('chart_accounts.index')"
  >
    <template #append>
      <VBtn
        v-if="$can('chart_accounts.export')"
        class="me-2"
        color="primary"
        @click="exportData"
        :disabled="
          !chartAccounts.length || isDownloadingExport || isChartAccountsLoading
        "
        :style="'opacity:' + (isDownloadingExport ? 0.5 : 1)"
      >
        {{
          isDownloadingExport ? $t("exporting") + "..." : $t("ImportMd.Export")
        }}
      </VBtn>
      <!-- <VBtn
        color="primary"
        @click="openModal('add')"
        v-if="$can('chart_accounts.store')"
      >
        {{ $t("Add") }}
      </VBtn> -->
    </template>
    <DataTableCore
      v-model="selected"
      :headers="headers"
      :items="chartAccounts"
      :total="total"
      :per_page="10"
      :is-loading="isChartAccountsLoading"
      :show-select="$can('chart_accounts.export')"
      :filter="filters"
      @change-filter="changeFilter"
    >
      <template #item.label="{ item }">
        {{ item.label }}
      </template>
      <template #item.is_active="{ item }">
        <StatusChip :title="item.is_active" />
      </template>
      <template #item.locked="{ item }">
        <StatusChip :title="item.locked ? 'oui' : 'non'" />
      </template>
      <template #item.companies="{ item }">
        <VChip
          v-for="(company, index) in item.companies.slice(0, 2)"
          :key="company.id"
          color="primary"
          class="me-1"
        >
          <span>
            {{ company.label }}
          </span>
        </VChip>
        <VChip v-if="item.companies.length > 2" color="primary" class="ml-1"
          >...
        </VChip>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('chart_accounts.show')"
            :tooltip-text="$t('show')"
            icon="tabler-eye"
            color="primary"
            @click="
              $router.push({
                name: 'accounting-plan-show',
                params: { id: item.id },
              })
            "
          />
          <TooltipIcon
            v-if="$can('chart_accounts.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="
              $router.push({
                name: 'accounting-plan-update',
                params: { id: item.id },
              })
            "
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useApi } from "@/composables/useApi";
import { useChartAccountStore, useCoreStore, useCompanyStore } from "@/stores";
import { useRouter } from "vue-router";

definePage({ meta: { navActiveLink: "settings-accounting-plans" } });

const t = inject("t");

const coreStore = useCoreStore();

const router = useRouter();
const companyStore = useCompanyStore();
const { companies } = storeToRefs(companyStore);
const { enums } = storeToRefs(coreStore);
const chartAccountStore = useChartAccountStore();
const {
  chartAccounts,
  isChartAccountsLoading,
  isDownloadingExport,
  isChartAccountLoading,
  total,
  filters,
} = storeToRefs(chartAccountStore);
const isDialogVisible = ref(false);
const selectedRole = ref(null);
const action = ref("");
const form = ref();
const selected = ref([]);
const chartAccountForm = ref({
  label: "",
  abv: "",
  is_active: "active",
  locked: false,
  company: null,
});
const errorMessages = ref({
  label: null,
  locked: null,
  abv: null,
  is_active: null,
  company: null,
});
// const companies = ref([]);
const showSnackbar = inject("showSnackbar");

const dialogTitle = computed(() => {
  return selectedRole.value
    ? `duplicate role ( ${selectedRole.value?.name} )`
    : "New Accounting Plan";
});

const headers = ref([
  {
    title: t("label"),
    sortable: true,
    key: "label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("abv"),
    sortable: true,
    key: "abv",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Status"),
    sortable: true,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  {
    title: t("locked"),
    sortable: true,
    key: "locked",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isLockedString, t),
  },
  {
    title: t("companies"),
    key: "companies",
    filtervalue: "",
    filterable: true,
    typefilter: "text",

  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

onMounted(async () => {
  await chartAccountStore.getDTchartAccounts();
  // const { data } = await useApi("companies");
  // companies.value = data.value.data;
  await companyStore.getOnlyActiveCompanies();
});

const exportData = async () => {
  await chartAccountStore.exportChartAccounts({ ids: selected.value });
};

function changeFilter(...obj) {
  chartAccountStore.getDTchartAccounts(...obj);
}

function openModal(actionName, item = null) {
  action.value = actionName;
  selectedRole.value = item;
  isDialogVisible.value = true;
}

function closeModal() {
  isDialogVisible.value = false;
  chartAccountForm.value = {
    label: "",
    is_active: "active",
    company: null,
    abv: "",
    locked: false,
  };
  errorMessages.value = {
    label: null,
    is_active: null,
    company: null,
    abv: null,
  };
  action.value = "";
  selectedRole.value = null;
}

async function SubmitEvent() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  const { statusCode, data } = await chartAccountStore.addChartAccount(
    chartAccountForm.value,
    action.value !== "add"
  );

  if (statusCode == 201) {
    closeModal();
    chartAccountStore.getDTchartAccounts();
    showSnackbar(t("Plan comptable créé avec succès."), { color: "success" });
    router.push({
      name: "accounting-plan-update",
      params: { id: data.data.id },
    });
  } else {
    showSnackbar(t("error") + data?.message ?? t("try again later"), {
      color: "error",
    });
  }

  onBeforeUnmount(async () => {
    await chartAccountStore.reset("chartAccounts");
  });
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
