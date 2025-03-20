<script setup>
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { useAuthStore } from '@/stores'

const showSnackbar = inject('showSnackbar')
const t = inject('t')
const authStore =  useAuthStore()
const email = ref('')
const type = ref('')
const formElt = ref()
const errors = ref({})
const isLoading = ref(false)
const authThemeImg = useGenerateImageVariant(authV2ForgotPasswordIllustrationLight, authV2ForgotPasswordIllustrationDark)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

async function onFormSubmit() {
  const { valid } = await formElt.value.validate()
  if (!valid) return
  isLoading.value = true

  const { statusCode, data } = await authStore.sendPasswordResetLink({ email: email.value })

  if(statusCode == 200) {
    showSnackbar(t("We have emailed your password reset link"),{color:'success'})
  } else if( statusCode == 422 ) {
    errors.value = data.errors
    showSnackbar(data.message ?? t("please fix errors"), { color: 'error' })
  } else {
    showSnackbar(t("try again in a few seconds"), { color: 'error' })
  }

  isLoading.value = false
}

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})
</script>

<template>
  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="368"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="mb-6"
          />
          <h4 class="text-h4 mb-1">
            {{ $t('Forget Password.Forgot') }} 🔒
          </h4>
          <p class="mb-0">
            {{ $t('Forget Password.Enter email') }}
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="formElt"
            :disabled="isLoading"
            @submit.prevent="onFormSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  :rules="[requiredValidator, emailValidator]"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                  :error-messages="errors?.email"
                />
              </VCol>

              <!-- Reset link -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  :disabled="isLoading"
                  :loading="isLoading"
                >
                  {{ $t('Forget Password.Send') }}
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                  :disabled="isLoading"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    class="flip-in-rtl"
                  />
                 
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
