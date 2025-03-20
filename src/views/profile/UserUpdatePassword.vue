<template>
  <VRow>
    <VCol cols="12">
      <VCard :title="t('Change Password')">
        <VCardText>
          <VAlert
            closable
            variant="tonal"
            color="warning"
            class="mb-4"
            :title="t('Ensure that these requirements are met')"
            :text="t('Minimum 8 characters long, uppercase & symbol')"
          />
  
          <VForm ref="itemForm" @submit.prevent>
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="password"
                  :label="t('New Password')"
                  placeholder="············"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                  :rules="[requiredValidator, passwordValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="confirmPassword"
                  :label="t('Confirm Password')"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                  :rules="[requiredValidator, passwordValidator, confirmedValidator(password, confirmPassword)]"
                />
              </VCol>
  
              <VCol cols="12 d-flex justify-end">
                <VBtn 
                  type="submit" 
                  @click="onSubmitChangePassword" 
                  :disabled="isLoadingPassword" 
                  :loading="isLoadingPassword"
                >
                  {{ t('update') }}
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup>
import { useProfile } from "@/composables/profile";

const t = inject("t")
const showSnackbar = inject("showSnackbar")

const {
  user,
  authStore,
  isUserLoading,
  isEditDialogVisible,
  handleUserUpdate,
  confirmPassword,
  password,
  isNewPasswordVisible,
  isConfirmPasswordVisible,
  isLoadingPassword,
  itemForm,
  onSubmitChangePassword,
} = useProfile(t, showSnackbar);

</script>
