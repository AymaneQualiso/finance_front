<!-- eslint-disable camelcase -->
<template>
  <VSnackbar
    v-model="isSnackbarVisible"
    location="top end"
    :color="snackbarColor"
    variant="flat"
  >
    {{ snackbarMessage }}
  </VSnackbar>
  <VCard
    :title="$t('general settings')"
    :loading="isLoading"
    v-if="$can('settings_general.index')"
  >
    <template #append>
      <VBtn
        v-if="$can('settings_general.update')"
        :disabled="isLoading"
        @click="onFormSubmit"
      >
        {{ $t("Save") }}
      </VBtn>
    </template>
    <VCard :disabled="isLoading" variant="flat">
      <VCardText class="pt-2">
        <VForm ref="formElt" class="mt-6" @submit.prevent>
          <VRow>
            <VCol md="6" cols="12">
              <AppTextField
                v-model="passwordValidityDurationInDays"
                :placeholder="$t('30')"
                :label="$t('password_validity_in_days')"
                :rules="[requiredValidator, integerValidator]"
                class="required"
                type="number"
                :error-messages="errors?.name"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VCard>
</template>

<script setup>
import { integerValidator } from "@/@core/utils/validators";
import { useApi } from "@/composables/useApi";
import { inject, onMounted, ref } from "vue";

const formElt = ref();
const errors = ref();
const t = inject("t");

definePage({
  meta: {
    navActiveLink: "settings-general",
  },
});

const isLoading = ref(false);
const isSnackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("default");
const passwordValidityDurationInDays = ref(0);

onMounted(async () => {
  isLoading.value = true;
  try {
    // Fetch data from the server
    const { data } = await useApi("settings/general").get();
    passwordValidityDurationInDays.value =
      data.value.data.password_validity_duration_in_days;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

async function onFormSubmit() {
  errors.value = null;

  const { valid } = await formElt.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    // Send data to the server
    const { statusCode } = await useApi("settings/general").put({
      password_validity_duration_in_days: passwordValidityDurationInDays.value,
    });

    if (statusCode.value === 200) {
    snackbarMessage.value = t("Settings saved successfully");
    snackbarColor.value = "success";
    isSnackbarVisible.value = true;
    } else {
      snackbarMessage.value = t("try again in a few seconds");
      snackbarColor.value = "error";
      isSnackbarVisible.value = true;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}
</script>
