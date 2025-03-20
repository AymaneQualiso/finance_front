<template>
  <VDialog
    v-model="insertCompanyGroupDialogShown"
    max-width="600"
    persistent
  >
    <DialogCloseBtn @click="closeInsertCompanyGroupModal" :disabled="isCompanyGroupLoading" />
    <VCard :title="dataCompanyGroup?.id ? modeReadOnly ? $t('company_groups.show_company_group') : $t('company_groups.update_company_group') : $t('company_groups.create_company_group')">
      <VCardText>
        <VForm ref="sendForm" :readonly="modeReadOnly">
          <VRow>
            <VCol cols="12">
              <AppTextField 
                v-model.trim="dataCompanyGroup.label"
                :placeholder="$t('label')"
                :label="$t('label')"
                :rules="[requiredValidator, minLengthValidator(dataCompanyGroup.label, 2)]"
                class="required"
                :loading="isCompanyGroupLoading"
              />
            </VCol>
          </VRow>
          
           <AppCombobox
    v-model="dataCompanyGroup.company"
    :label="$t('Company')"
    :placeholder="$t('Company')"
    :items="companies"
    item-title="label"
    item-value="id"
    :rules="[requiredValidator]"
    class="mt-2 required"
    :return-object="false"
    chips
    closable-chips
    multiple 
    clearable 
  />
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="dataCompanyGroup.is_active"
                :label="$t('is_active')"
                :placeholder="$t('is_active')"
                :items="getEnums(enums.isActive, $t)"
                item-title="title"
                item-value="key"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
                :loading="isCompanyGroupLoading"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3" v-if="!modeReadOnly">
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="isCompanyGroupLoading"
          @click="closeInsertCompanyGroupModal"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="isCompanyGroupLoading"
          :disabled="isCompanyGroupLoading"
          @click="submitInsertCompanyGroupModal"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<script setup>
import { useCompanyGroup } from "@/composables/companyGroup.js";
import {  useCompanyStore } from "@/stores";

const companyStore = useCompanyStore();
const { companies } = storeToRefs(companyStore);

const emit = defineEmits(['update:isInsertCompanyGroupDialogShown']);
const insertCompanyGroupDialogShown = defineModel("isInsertCompanyGroupDialogShown", {
  type: Boolean,
  default: false,
});
const dataCompanyGroup = defineModel("data", {
  type: Object,
  default: () => ({}),
});


const modeReadOnly = defineModel("readOnlyMode", {
  type: Boolean,
  default: false
})

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const {
  companyGroupStore,
  isCompanyGroupLoading,
  companyGroups,
  coreStore,
  enums,
  sendForm,
} = useCompanyGroup(t, showSnackbar)

function closeInsertCompanyGroupModal() {
  emit('update:isInsertCompanyGroupDialogShown', false);
  emit('update:showCompanyGroupInReadOnlyMode', false)
}

function submitInsertCompanyGroupModal() {
  sendForm.value.validate().then(async ({ valid }) => {
    if (!valid) return
    dataCompanyGroup.value.label = capitalizeFirstLetter(dataCompanyGroup.value.label);
    const { statusCode, data } = dataCompanyGroup.value?.id ? await companyGroupStore.updateCompanyGroup(dataCompanyGroup.value) : await companyGroupStore.addCompanyGroup(dataCompanyGroup.value)

    if (statusCode == 201) {
      showSnackbar(t("Added ok", { model: t("company_groups.company_group") }), { color: "success" });
      closeInsertCompanyGroupModal()
    } else if (statusCode == 200) {
      showSnackbar(t("Updated ok", { model: t("company_groups.company_group") }), { color: "success" });
      closeInsertCompanyGroupModal()
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

// function submitInsertCompanyGroupModal() {
//   sendForm.value.validate().then(async ({ valid }) => {
//     if (!valid) return;

//     // Ensure label formatting
//     dataCompanyGroup.value.label = capitalizeFirstLetter(dataCompanyGroup.value.label);

//     // Prepare payload including selected company IDs
//     const payload = {
//       label: dataCompanyGroup.value.label,
//       is_active: dataCompanyGroup.value.is_active,
//             company: Array.isArray(dataCompanyGroup.value.company) ? dataCompanyGroup.value.company : [],


//     };
//     console.log("Sending payload:", payload);

//     // If updating an existing group
//     if (dataCompanyGroup.value?.id) {
//       payload.id = dataCompanyGroup.value.id;
//     }

//     // Send request
//     const { statusCode, data } = dataCompanyGroup.value?.id
//       ? await companyGroupStore.updateCompanyGroup(payload)
//       : await companyGroupStore.addCompanyGroup(payload);

//     // Handle response
//     if (statusCode == 201) {
//       showSnackbar(t("Added ok", { model: t("company_groups.company_group") }), { color: "success" });
//       closeInsertCompanyGroupModal();
//     } else if (statusCode == 200) {
//       showSnackbar(t("Updated ok", { model: t("company_groups.company_group") }), { color: "success" });
//       closeInsertCompanyGroupModal();
//     } else if (statusCode === 422) {
//       if (data.errors && Object.keys(data.errors).length > 0) {
//         const firstErrorKey = Object.keys(data.errors)[0];
//         const firstErrorMessage = data.errors[firstErrorKey][0];

//         showSnackbar(t(firstErrorMessage), { color: "error" });
//       } else {
//         showSnackbar(t(data.message), { color: "error" });
//       }
//     } else {
//       showSnackbar(t("try again in a few seconds"), { color: "error" });
//     }
//   });
// }
onMounted(async () => {
  // await chartAccountStore.getChartAccount(route.params?.id);
  // Fetch companies
  // const { data } = await useApi("companies");
  // companies.value = data.value.data;
  await companyStore.getOnlyActiveCompanies();
});


</script>
