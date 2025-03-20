<template>

  <VDialog v-model="insertAccountsDialogShown" max-width="600" persistent>
    <DialogCloseBtn
      @click="closeInsertAccountsModal"
      :disabled="isLoadingAccounts"
    />
    <VCard
      :title="
        dataAccount?.id
          ? modeReadOnly
            ? $t('accounts.show_account')
            : $t('accounts.update_account')
          : $t('accounts.create_account')
      "
    >
      <VCardText>
        <VForm ref="sendForm" :readonly="modeReadOnly">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="dataAccount.label"
                :placeholder="$t('label')"
                :label="$t('label')"
                :rules="[requiredValidator]"
                :class="{ required: !modeReadOnly }"
                :loading="isLoadingAccounts"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="dataAccount.label_2"
                :placeholder="$t('accounts.label_2')"
                :label="$t('accounts.label_2')"
                :loading="isLoadingAccounts"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6">
              <AppTextField
                v-model="dataAccount.value"
                :label="$t('N° Compte')"
                :placeholder="$t('N° Compte')"
                :rules="[
                  requiredValidator,
                  numericValidator,
                  lengthValidator(dataAccount.value, 9, 4),
                ]"
                :class="{ required: !modeReadOnly }"
                :loading="isLoadingAccounts"
                :readonly="dataAccount.id"
              />
            </VCol>
          <!-- </VRow>
          <VRow> -->
            <VCol cols="6">
              <AppCombobox
                v-model="dataAccount.is_active"
                :label="$t('is_active')"
                :placeholder="$t('is_active')"
                :items="getEnums(enums.isActive, $t)"
                item-title="title"
                item-value="key"
                :rules="[requiredValidator]"
                :class="{ required: !modeReadOnly }"
                :return-object="false"
                :loading="isLoadingAccounts"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="dataAccount.id_chart_account"
                :label="$t('accounts.chart_account')"
                :placeholder="$t('accounts.chart_account')"
                :items="chartAccounts"
                item-title="label"
                item-value="id"
                :rules="[requiredValidator]"
                :class="{ required: !modeReadOnly }"
                :return-object="false"
                :loading="isLoadingAccounts"
                :readonly="dataAccount.id"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="6" id="account_type" v-if="!modeReadOnly">
              <AppCombobox
                v-model="dataAccount.account_type"
                :label="$t('accounts.account_type')"
                :placeholder="$t('accounts.account_type')"
                :items="accountTypes"
                item-title="label"
                item-value="id"
                :rules="[]"
                :class="{ required: !modeReadOnly }"
                :return-object="false"
                :loading="isLoadingAccounts"
                />
                <!-- hide-selected -->
            </VCol>
            <VCol cols="6" id="account_type_det" v-if="!modeReadOnly">
              <AppCombobox
                v-model="selectedAccountTypeDets"
                :label="
                  $t('accounts.account_type_det') 
                 
                "
                :placeholder="$t('accounts.account_type_det')"
                :items="newAccountTypeDetsItems"
                item-title="label"
                item-value="id"
                multiple
                chips
                :rules="[requiredValidator, uniqueAccountTypeDet]"
                :class="{ required: !modeReadOnly }"
                :return-object="false"
                :loading="isLoadingAccounts"
                />
                <!-- hide-selected -->
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" v-if="selectedAccountTypeDets.length">
              <label class="mb-1 text-body-2 text-high-emphasis">{{
                $t("accounts.selected_account_type_dets")
              }}</label>
              <div style="border: 1px solid #ccc; border-radius: 4px">
                <VChip
                  v-for="(det, index) in selectedAccountTypeDets"
                  :key="index"
                  class="ma-2"
                  color="primary"
                  label
                  text-color="white"
                  close
                  @click="!modeReadOnly ? removeAccountTypeDet(index) : null"
                  v-tooltip="!modeReadOnly ? $t('Click to remove') : ''"
                  >
                  <!-- @click="removeAccountTypeDet(index)" -->
                  {{ getAccountTypeDetLabel(det) }}
                </VChip>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText
        class="d-flex justify-end flex-wrap gap-3"
        v-if="!modeReadOnly"
      >
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="isLoadingAccounts"
          @click="closeInsertAccountsModal"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="isLoadingAccounts"
          :disabled="isLoadingAccounts"
          @click="submitInsertAccountModal"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useAccounts } from "@/composables/account.js";
import { watch, ref } from "vue";

const emit = defineEmits(["update:isInsertAccountsDialogShown"]);
const insertAccountsDialogShown = defineModel("isInsertAccountsDialogShown", {
  type: Boolean,
  default: false,
});
const dataAccount = defineModel("data", {
  type: Object,
  default: () => ({}),
});

const modeReadOnly = defineModel("readOnlyMode", {
  type: Boolean,
  default: false,
});

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const newAccountTypeDetsItems = ref([]);
const selectedAccountTypeDets = ref([]);
const {
  accountsStore,
  isLoadingAccounts,
  isLoadingChartAccountsCompany,
  chartAccountsCompanies,
  classAccount3sStore,
  classAccount3s,
  chartAccounts,
  coreStore,
  enums,
  sendForm,
  accountTypesDets,
  accountTypes,
} = useAccounts(t, showSnackbar);

watch(
  dataAccount,
  (newValue, oldValue) => {
    if (newValue.account_type) {
      newAccountTypeDetsItems.value = accountTypesDets.value.filter(
        (item) => item.account_type_id == newValue.account_type
      );
    }
  },
  { deep: true }
);

watch(
  dataAccount,
  (newValue) => {
    if (newValue.account_type_dets) {
      selectedAccountTypeDets.value = parseAccountTypeDets(
        newValue.account_type_det_ids
      );
    }
  },
  { immediate: true, deep: true }
);

watch(
  selectedAccountTypeDets,
  (newValue) => {
    const uniqueAccountTypeDets = [];
    const accountTypeIds = new Set();

    newValue.forEach((det) => {
      const accountTypeDet = accountTypesDets.value.find(
        (item) => item.id === det
      );
      if (
        accountTypeDet &&
        !accountTypeIds.has(accountTypeDet.account_type_id)
      ) {
        accountTypeIds.add(accountTypeDet.account_type_id);
        uniqueAccountTypeDets.push(det);
      }
    });

    if (uniqueAccountTypeDets.length !== selectedAccountTypeDets.value.length) {
      selectedAccountTypeDets.value = uniqueAccountTypeDets;
    }
  },
  { deep: true }
);

function closeInsertAccountsModal() {
  emit("update:isInsertAccountsDialogShown", false);
  emit("update:showAccountsInReadOnlyMode", false);
  selectedAccountTypeDets.value = []
}

function submitInsertAccountModal() {
  sendForm.value.validate().then(async ({ valid }) => {
    if (!valid) return;

    dataAccount.value.label = capitalizeFirstLetter(dataAccount.value.label);
    if (dataAccount.value.label_2)
      dataAccount.value.label_2 = capitalizeFirstLetter(
        dataAccount.value.label_2
      );

    dataAccount.value.account_type_dets = selectedAccountTypeDets.value;

    const { statusCode, data } = dataAccount.value?.id
      ? await accountsStore.updateAccount(dataAccount.value)
      : await accountsStore.createAccount(dataAccount.value);

    if (statusCode == 201) {
      showSnackbar(t("Added ok", { model: t("accounts.account") }), {
        color: "success",
      });
      closeInsertAccountsModal();
    } else if (statusCode == 200) {
      showSnackbar(t("Updated ok", { model: t("accounts.account") }), {
        color: "success",
      });
      closeInsertAccountsModal();
    } else if (statusCode === 422) {
      // showSnackbar(t(data.message), { color: "error" })
      if (data.errors && Object.keys(data.errors).length > 0) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];

        showSnackbar(t(firstErrorMessage), { color: "error" });
      } else {
        showSnackbar(t(data.message), { color: "error" });
      }
    } else if (statusCode === 501) {
      showSnackbar(t(data.message), { color: "error" });
    } else {
      showSnackbar(t("try again in a few seconds"), { color: "error" });
    }
  });
}

function parseAccountTypeDets(accountTypeDetsString) {
  if (!accountTypeDetsString) return [];
  return accountTypeDetsString.split(",").map((id) => parseInt(id.trim(), 10));
}

// Custom validation rule
function uniqueAccountTypeDet(value) {
  const accountTypeIds = value.map((det) => {
    const accountTypeDet = accountTypesDets.value.find(
      (item) => item.id === det
    );
    return accountTypeDet ? accountTypeDet.account_type_id : null;
  });

  const uniqueAccountTypeIds = new Set(accountTypeIds);
  return (
    uniqueAccountTypeIds.size === accountTypeIds.length ||
    t("You can only select one account_type_det per account_type")
  );
}

// Get label for account_type_det
function getAccountTypeDetLabel(id) {
  const accountTypeDet = accountTypesDets.value.find((item) => item.id === id);
  return accountTypeDet ? accountTypeDet.label : "";
}

function removeAccountTypeDet(index) {
  selectedAccountTypeDets.value.splice(index, 1);
}
</script>
<style >
/* #account_type .v-combobox__selection {
  display: none !important;
} */

#account_type_det .v-combobox__selection {
  display: none !important;
}
</style>
