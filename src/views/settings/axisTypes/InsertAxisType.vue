<template>
  <VDialog v-model="insertAxisTypeDialogShown" max-width="600" persistent>
    <DialogCloseBtn
      @click="closeInsertAxisTypeModal"
      :disabled="isLoadingAxisType"
    />
    <VCard
      :title="
        dataAxisType?.id
          ? modeReadOnly
            ? $t('axis_types.show_axis_type')
            : $t('axis_types.update_axis_type')
          : $t('axis_types.create_axis_type')
      "
    >
      <VCardText>
        <VForm ref="sendForm" :readonly="modeReadOnly">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="dataAxisType.label"
                :placeholder="$t('label')"
                :label="$t('label')"
                :rules="[requiredValidator]"
                class="required"
                :loading="isLoadingAxisType"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="dataAxisType.is_active"
                :label="$t('is_active')"
                :placeholder="$t('is_active')"
                :items="getEnums(enums.isActive, $t)"
                item-title="title"
                item-value="key"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
                :loading="isLoadingAxisType"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="dataAxisType.is_required"
                :label="$t('required')"
                :placeholder="$t('required')"
                :items="isRequiredData"
                item-title="text"
                item-value="value"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
                :loading="isLoadingAxisType"
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
          :disabled="isLoadingAxisType"
          @click="closeInsertAxisTypeModal"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="isLoadingAxisType"
          :disabled="isLoadingAxisType"
          @click="submitInsertAxisTypeModal"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
<script setup>
import { useAxisType } from "@/composables/axisType.js";

const emit = defineEmits(["update:isInsertAxisTypeDialogShown"]);
const insertAxisTypeDialogShown = defineModel("isInsertAxisTypeDialogShown", {
  type: Boolean,
  default: false,
});
const dataAxisType = defineModel("data", {
  type: Object,
  default: () => ({}),
});
const modeReadOnly = defineModel("readOnlyMode", {
  type: Boolean,
  default: false,
});

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const {
  axisTypeStore,
  isLoadingAxisType,
  axisTypes,
  isRequiredData,
  coreStore,
  enums,
  sendForm,
} = useAxisType(t, showSnackbar);

function closeInsertAxisTypeModal() {
  emit("update:isInsertAxisTypeDialogShown", false);
  emit("update:showAxisTypeInReadOnlyMode", false);
}

function submitInsertAxisTypeModal() {
  sendForm.value.validate().then(async ({ valid }) => {
    if (!valid) return;
    dataAxisType.value.label = capitalizeFirstLetter(dataAxisType.value.label);
    // if its update mode and status is not active and is required, then show error message saying 'Impossible de désactiver un type obligatoire.'

    if (
      dataAxisType.value.id &&
      dataAxisType.value.is_active === "inactive" &&
      dataAxisType.value.is_required === "oui"
    ) {
      showSnackbar(t("Impossible de désactiver un type obligatoire."), {
        color: "error",
      });
      return;
    }
    const { statusCode, data } = dataAxisType.value?.id
      ? await axisTypeStore.updateAxisType(dataAxisType.value)
      : await axisTypeStore.createAxisType(dataAxisType.value);

    if (statusCode == 201) {
      showSnackbar(t("Added ok", { model: t("axis_types.axis_type") }), {
        color: "success",
      });
      closeInsertAxisTypeModal();
    } else if (statusCode == 200) {
      showSnackbar(t("Updated ok", { model: t("axis_types.axis_type") }), {
        color: "success",
      });
      closeInsertAxisTypeModal();
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
</script>
