<template>
  <VDialog @close="$emit('close')" persistent max-width="600">
    <VCard>
      <VCardTitle>{{ $t("Add Class") }} {{ classType }}</VCardTitle>
      <VCardText>
        <AppTextField
          v-model="classData.label"
          :label="$t('label')"
          :placeholder="$t('label')"
          :error-messages="errorMessages.label"
        />
        <AppTextField
          v-model="classData.value"
          :label="$t('value')"
          :placeholder="$t('value')"
          type="text"
          :maxLength="classType === 1 ? 1 : classType === 2 ? 2 : 3"
          :error-messages="errorMessages.value"
        />

        <AppCombobox
          v-model="classData.is_active"
          :label="$t('is_active')"
          :placeholder="$t('is_active')"
          :items="getEnums(enums.isActive, $t)"
          item-title="title"
          item-value="key"
          :rules="[requiredValidator]"
          class="required"
          :return-object="false"
        />
      </VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" @click="$emit('close')" :disabled="isLoading">{{ $t("Cancel") }}</VBtn>
        <VBtn @click="submitClass"  :disabled="isLoading">
          <VProgressCircular
            v-if="isLoading"
            indeterminate
            color="secondary"
            :size="20"
            width="3"
            class="ml-2"
          /> &nbsp;
          {{ $t("Submit") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useChartAccountStore, useCoreStore } from "@/stores";
import { inject, ref } from "vue";

const t = inject("t");
const props = defineProps({
  classType: Number,
  classData: Object,
  parentClasses: Array,
});
const isLoading = ref(false)

const chartAccountStore = useChartAccountStore();
const emits = defineEmits(["update-class"]);
const classData = ref({ ...props.classData });
const errorMessages = ref({ label: "", value: "" });
const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);

const { toBeEditedClass, isEditMode } = storeToRefs(chartAccountStore);

watch(
  () => isEditMode.value,
  (value) => {
    if (value) {
      classData.value = { ...toBeEditedClass.value };
    } else {
      classData.value = { ...props.classData };
    }
  }
);

// add is_active property to classData
if (!classData.value.is_active) {
  classData.value.is_active = "active";
}

function submitClass() {
  isLoading.value = true;
  if (!classData.value.label) {
    errorMessages.value.label = t("Label is required");
    isLoading.value = false;
    return;
  }

  if (!classData.value.value) {
    errorMessages.value.value = t("Value is required")
    isLoading.value = false;
    return;
  }

  if (isNaN(classData.value.value)) {
    errorMessages.value.value = t("Value must be a number");
    isLoading.value = false;
    return;
  }

  if (props.classType === 2 && classData.value.value.length !== 2) {
    errorMessages.value.value = t("Value must be 2 digits");
    isLoading.value = false;
    return;
  }
  if (props.classType === 3 && classData.value.value.length !== 3) {
    errorMessages.value.value = t("Value must be 3 digits");
    isLoading.value = false;
    return;
  }

  if (props.classType === 2) {
    const firstDigit = classData.value.value[0];
    const class1 = props.parentClasses.find((c) => c.num === firstDigit);
    if (!class1) {
      errorMessages.value.value = firstDigit + " " + t("must exist in class 1");
      isLoading.value = false;
      return;
    }

    classData.value.parent = class1.id;
  }

  if (props.classType === 3) {
    const firstTwoDigits = classData.value.value.substring(0, 2);

    const class2 = props.parentClasses.find((c) => c.num === firstTwoDigits);

    if (!class2) {
      errorMessages.value.value =
        firstTwoDigits + " " + t("must exist in class 2");
        isLoading.value = false;
      return;
    }

    classData.value.parent = class2.id;
  }

  emits("update-class", classData.value,isLoading);
  classData.value = { label: "", value: "", is_active: null }; // Reset data
  errorMessages.value = { label: "", value: "" }; // Reset error messages
  classData.value.is_active = "active"
}
</script>
