
<template>
  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol lg="8" class="d-none d-lg-flex">
      <div class="position-relative rounded-lg w-100 ma-8 me-0 my-auto">
        <div class="">
          <VImg
            :src="authThemeImg"
            class="auth-illustration rounded-lg"
            height="40em"
          />
        </div>

        <VImg :src="authThemeMask" class="auth-footer-mask" />
      </div>
    </VCol>

    <VCol lg="4" class="d-flex align-center justify-center">
      <VCard flat style="inline-size: 500px">
        <VCardText class="d-flex justify-center">
          <!-- <img
            class="logo-dark mb-6"
            src="https://retenuealasource.ma/wp-content/uploads/2024/07/LOGO_retenu_Plan-de-travail-1-copie-3.svg"
            width="200px"
          > -->
          <VNodeRenderer :nodes="themeConfig.app.logo" class="mb-6" />

          <!-- <img
            class="logo-light"
            src="/images/white-logo.svg"
            width="200"
          > -->
        </VCardText>
        <VCardText>
          <p class="mb-1" style="font-weight: bold">
            Connectez-vous à votre compte
          </p>
          <VForm ref="refVForm" :disabled="loading" @submit.prevent="onSubmit">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  label="Email"
                  placeholder="Email"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  :label="$t('Password')"
                  :placeholder="$t('Password')"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
                <VBtn block type="submit" :loading="loading" class="mt-6">
                  {{ $t("Login") }}
                </VBtn>
                <div
                  class="d-flex align-center flex-wrap justify-center mt-2 mb-4"
                >
                  <!--
                    <VCheckbox
                    v-model="rememberMe"
                    label="Remember me"
                    />
                  -->
                  <RouterLink
                    class="text-primary ms-2 mb-0"
                    :to="{ name: 'forgot-password' }"
                    style="font-weight: bold"
                  >
                    {{ $t("Forgot Password") }}
                  </RouterLink>
                </div>
                <div class="d-flex justify-center">
                  <hr style="background-color: #183b6e; inline-size: 280px" />
                </div>

                <div
                  class="d-flex flex-column justify-content-center mt-2 text-center"
                >
                  <VCardText class="mb-0" style="font-weight: bold">
                    Besoin d'aide ? <br />
                    Contactez-nous sur
                    <a href="mailto:support@finances.ma">support@finances.ma</a>
                  </VCardText>
                </div>

                <VAlert
  v-if="errors?.statusCode && errors?.statusCode !== 200"
  class="mt-3"
  icon="tabler-shield-lock"
  prominent
  variant="tonal"
  color="error"
>
  <span v-if="errors?.statusCode === 402">{{ $t("account is inactive") }}</span>
  <span v-else-if="errors?.statusCode === 403">{{ $t("account is inactive") }}</span>
  <span v-else>{{ $t("incorrect email or password") }}</span>
</VAlert>
              </VCol>

              <!-- create account -->

              <!--
                <VCol
                cols="12"
                class="text-center"
                >
                <span>New on our platform?</span>
                <RouterLink
                class="text-primary ms-2"
                :to="{ name: 'register' }"
                >
                Create an account
                </RouterLink>
                </VCol>
              -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup>
import { useAuthStore } from "@/stores";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import { isEmpty } from "lodash";
import { VForm } from "vuetify/components/VForm";

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

const authStore = useAuthStore();
const {
  errors,
  user,
  twoFactorAuth,
  passwordValidityHasBeenExpired,
  resetPasswordToken,
  changePasswordFirstTime,
} = storeToRefs(authStore);

definePage({
  meta: {
    layout: "blank",
    unauthenticatedOnly: true,
  },
});

const isPasswordVisible = ref(false);
const route = useRoute();
const router = useRouter();

const refVForm = ref();
const loading = ref(false);

const credentials = ref({
  email: "",
  password: "",
});

const rememberMe = ref(false);

const login = async () => {
  try {
    loading.value = true;

    await authStore.login(credentials.value);

    loading.value = false;

    if (changePasswordFirstTime.value) {
      await router.push({
        name: "change-password",
        query: {
          email: credentials.value.email,
          token: resetPasswordToken.value,
          type: 'change_password_first_time'
        },
      });

      return;
    }

    if (passwordValidityHasBeenExpired.value) {
      await router.push({
        name: "change-password",
        query: {
          email: credentials.value.email,
          token: resetPasswordToken.value,
        },
      });

      return;
    }

    if (twoFactorAuth.value) {
      await router.push({
        name: "two-factor",
        query: { to: route.query.to, email: credentials.value.email },
      });

      return;
    }

    if (isEmpty(user.value)) return;

    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : "/");
    });
  } catch (err) {
    console.error(err);
  }
};

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) login();
  });
};
</script>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

/* we will explain what these classes do next! */

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
