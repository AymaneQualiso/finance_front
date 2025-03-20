<template>
  <VRow class="auth-wrapper bg-surface" no-gutters>
    <VCol lg="8" class="d-none d-lg-flex">
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="368"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg class="auth-footer-mask" :src="authThemeMask" />
      </div>
    </VCol>

    <VCol cols="12" lg="4" class="d-flex align-center justify-center">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
        <VCardText>
          <VNodeRenderer :nodes="themeConfig.app.logo" class="mb-6" />
          <h4 class="text-h4 mb-1">{{ $t("reinforced_auth") }} 🔒</h4>
          <p class="mb-0 text-primary">
            {{
              $t(
                "Vous avez l'authentification renforcé activé, veuillez tapez le code que vous venez de recevoir par mail pour continuer votre connexion."
              )
            }}
          </p>
        </VCardText>

        <VCardText>
          <VRow>
            <!-- email -->
            <VCol cols="12" class="my-6">
              <div v-if="isLoading" class="text-center">
                <div class="lds-dual-ring"></div>
              </div>
              <v-otp-input
                v-else
                ref="otpInput"
                input-classes="otp-input"
                :conditionalClass="[
                  'one',
                  'two',
                  'three',
                  'four',
                  'five',
                  'six',
                ]"
                inputType="number"
                :num-inputs="6"
                v-model:value="twoFactorAuthCode"
                :should-auto-focus="true"
                :should-focus-order="true"
                @on-complete="handleOnComplete"
                :placeholder="['*', '*', '*', '*', '*', '*']"
                :is-disabled="isLoading"
              />
            </VCol>

            <!-- Reset link -->
            <VCol cols="12">
              <p class="mb-0 text-secondary text-center">
                {{
                  $t(
                    "Vous n'avez pas reçu le code ? Veuillez patienter quelques instants et vérifier votre boite mail."
                  )
                }}
              </p>
              <div class="text-center">
                <VBtn
                  :disabled="isLoading"
                  :loading="isLoading"
                  variant="text"
                  style="text-decoration: underline"
                  @click="resendCode"
                >
                  {{ $t("Renvoyez le code par mail") }}
                </VBtn>
              </div>

              <VAlert
                v-if="
                  errors?.twoFactorStatusCode &&
                  errors?.twoFactorStatusCode !== 200
                "
                class="mt-3"
                icon="tabler-shield-lock"
                prominent
                variant="tonal"
                color="error"
              >
                Code invalide
              </VAlert>
              <VAlert
                v-if="
                  errors?.resendTwoFactorStatusCode &&
                  errors?.resendTwoFactorStatusCode !== 200
                "
                class="mt-3"
                icon="tabler-shield-lock"
                prominent
                variant="tonal"
                color="warning"
              >
                Erreur lors de l'envoi du code, veuillez réessayer
              </VAlert>
            </VCol>

            <!-- back to login -->
            <VCol cols="12">
              <RouterLink
                class="d-flex align-center justify-center"
                :to="{ name: 'login' }"
              >
                <VIcon icon="tabler-chevron-left" class="flip-in-rtl" />
                <span>{{ $t("back-to-login") }}</span>
              </RouterLink>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>


<script setup>
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import authV2ForgotPasswordIllustrationDark from "@images/pages/auth-v2-forgot-password-illustration-dark.png";
import authV2ForgotPasswordIllustrationLight from "@images/pages/auth-v2-forgot-password-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
import { useAuthStore } from "@/stores";
import { storeToRefs } from "pinia";
import VOtpInput from "vue3-otp-input";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const authStore = useAuthStore();
const { user, errors } = storeToRefs(authStore);

const route = useRoute();
const router = useRouter();

const twoFactorAuthCode = ref("");
const isLoading = ref(false);
const authThemeImg = useGenerateImageVariant(
  authV2ForgotPasswordIllustrationLight,
  authV2ForgotPasswordIllustrationDark
);
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);
const email = ref(route.query.email);

const otpInput = ref(null);

const handleOnComplete = async (otpValue) => {
  try {
    isLoading.value = true;

    await authStore.verifyTwoFactorAuthCode({
      code: otpValue,
      email: email.value,
    });

    isLoading.value = false;

    if (errors.value.twoFactorStatusCode) {
      isLoading.value = false;
    } else {
      router.replace("/");
    }
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};

const resendCode = async () => {
  try {
    isLoading.value = true;
    clearInput();

    await authStore.resendTwoFactorAuthCode({
      email: email.value,
    });

    isLoading.value = false;
  } catch (error) {
    console.log(error);
    isLoading.value = false;
  }
};

const clearInput = () => {
  otpInput.value?.clearInput();
};

definePage({
  meta: {
    layout: "blank",
    unauthenticatedOnly: true,
  },
});
</script>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
.otp-input {
  width: 50px;
  height: 45px;
  padding: 5px;
  margin: 0 10px;
  font-size: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
}
/* Background colour of an input field with value */
.otp-input.is-complete {
  background-color: #cbc3e3;
}
.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input::placeholder {
  font-size: 15px;
  text-align: center;
  font-weight: 600;
}

.lds-dual-ring,
.lds-dual-ring:after {
  box-sizing: border-box;
}
.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6.4px solid currentColor;
  border-color: currentColor transparent currentColor transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
