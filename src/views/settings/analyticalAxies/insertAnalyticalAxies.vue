<template>
  <VDialog
    v-model="insertAnalyticalAxiesDialogShown"
    max-width="600"
    persistent
  >
    <DialogCloseBtn
      @click="closeInsertAnalyticalAxiesModal"
      :disabled="isLoadingAnalyticalAxies"
    />
    <VCard
      :title="
        dataAnalyticalAxie?.id
          ? modeReadOnly
            ? $t('analytical_axies.show_analytical_axie')
            : $t('analytical_axies.update_analytical_axie')
          : $t('analytical_axies.create_analytical_axie')
      "
    >
      <VCardText>
        <VForm ref="sendForm" :readonly="modeReadOnly">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="dataAnalyticalAxie.label"
                :placeholder="$t('label')"
                :label="$t('label')"
                :rules="[requiredValidator]"
                class="required"
                :loading="isLoadingAnalyticalAxies"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="dataAnalyticalAxie.is_active"
                :label="$t('is_active')"
                :placeholder="$t('is_active')"
                :items="getEnums(enums.isActive, $t)"
                item-title="title"
                item-value="key"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
                :loading="isLoadingAnalyticalAxies"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="dataAnalyticalAxie.code"
                :placeholder="$t('code')"
                :label="$t('code')"
                :rules="[requiredValidator, checkCode]"
                class="required"
                :loading="isLoadingAnalyticalAxies"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="dataAnalyticalAxie.axis_type_id"
                :label="$t('axis_types.axis_type')"
                :placeholder="$t('axis_types.axis_type')"
                :items="axisTypes"
                item-title="label"
                item-value="id"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
                :loading="isLoadingAnalyticalAxies"
              />
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
          :disabled="isLoadingAnalyticalAxies"
          @click="closeInsertAnalyticalAxiesModal"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="isLoadingAnalyticalAxies"
          :disabled="isLoadingAnalyticalAxies"
          @click="submitInsertAxisTypeModal"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<script setup>
import { useAnalyticalAxies } from "@/composables/analyticalAxies.js";

const emit = defineEmits(["update:isInsertAnalyticalAxiesDialogShown"]);
const insertAnalyticalAxiesDialogShown = defineModel(
  "isInsertAnalyticalAxiesDialogShown",
  {
    type: Boolean,
    default: false,
  }
);
const dataAnalyticalAxie = defineModel("data", {
  type: Object,
  default: () => ({
    is_active: "active",
    is_required: "oui",
  }),
});
const modeReadOnly = defineModel("readOnlyMode", {
  type: Boolean,
  default: false,
});

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const {
  analyticalAxiesStore,
  isLoadingAnalyticalAxies,
  axisTypes,
  companies,
  isRequiredData,
  coreStore,
  enums,
  sendForm,
  codeExist,
} = useAnalyticalAxies(t, showSnackbar);

function closeInsertAnalyticalAxiesModal() {
  emit("update:isInsertAnalyticalAxiesDialogShown", false);
  emit("update:showAnalyticalAxiesInReadOnlyMode", false);
}

function submitInsertAxisTypeModal() {
  sendForm.value.validate().then(async ({ valid }) => {
    if (!valid) return;
    dataAnalyticalAxie.value.label = capitalizeFirstLetter(
      dataAnalyticalAxie.value.label
    );
    const { statusCode, data } = dataAnalyticalAxie.value?.id
      ? await analyticalAxiesStore.updateAnalyticalAxie(
          dataAnalyticalAxie.value
        )
      : await analyticalAxiesStore.createAnalyticalAxie(
          dataAnalyticalAxie.value
        );

    if (statusCode == 201) {
      showSnackbar(
        t("Added ok", { model: t("analytical_axies.analytical_axie") }),
        { color: "success" }
      );
      closeInsertAnalyticalAxiesModal();
    } else if (statusCode == 200) {
      showSnackbar(
        t("Updated ok", { model: t("analytical_axies.analytical_axie") }),
        { color: "success" }
      );
      closeInsertAnalyticalAxiesModal();
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
  });
}

watch(
  () => insertAnalyticalAxiesDialogShown,
  (newVal) => {
    if (newVal) {
      dataAnalyticalAxie.value = {
        is_active: "active",
        is_required: "oui",
        la: "",
        code: "",
        axis_type_id: null,
      };
    }
  }
);

async function checkCode() {
  const res = await analyticalAxiesStore.checkCode(
    dataAnalyticalAxie.value.code,
    dataAnalyticalAxie.value.id
  );
  if (res) {
    if (codeExist.value) return t("Code existe");
  }
}
</script>
