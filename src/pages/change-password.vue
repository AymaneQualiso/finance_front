<script setup>
import { VForm } from "vuetify/components/VForm";
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import authV2RegisterIllustrationBorderedDark from "@images/pages/auth-v2-register-illustration-bordered-dark.png";
import authV2RegisterIllustrationBorderedLight from "@images/pages/auth-v2-register-illustration-bordered-light.png";
import authV2RegisterIllustrationDark from "@images/pages/auth-v2-register-illustration-dark.png";
import authV2RegisterIllustrationLight from "@images/pages/auth-v2-register-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
import { useAuthStore } from "@/stores";

const imageVariant = useGenerateImageVariant(
  authV2RegisterIllustrationLight,
  authV2RegisterIllustrationDark,
  authV2RegisterIllustrationBorderedLight,
  authV2RegisterIllustrationBorderedDark,
  true
);
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

const authStore = useAuthStore();
const { errors, user } = storeToRefs(authStore);

definePage({
  meta: {
    layout: "blank",
    unauthenticatedOnly: true,
  },
});

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const formElt = ref();
const isLoading = ref(false);
const router = useRouter();
const route = useRoute();

const form = ref({
  email: route.query?.email,
  token: route.query?.token,
  type: route.query?.type ,
  password: "",
  password_confirmation: "",
});

const isPasswordVisible = ref(false);
const isPasswordConfirmVisible = ref(false);

const typeMessage = computed(() => {
  switch (form.value.type) {
    case "Password_forgotten":
      return "Mot de passe oublié ? Veuillez saisir un nouveau mot de passe.";
    case "change_password_first_time":
      return "Vous devez définir un mot de passe pour la première fois.";
    default:
      return t("Change PWD.Set PWD");
  }
});

async function onFormSubmit() {
  const { valid } = await formElt.value.validate();
  if (!valid) return;
  isLoading.value = true;

  const { statusCode, data } = await authStore.resetPassword(form.value);

  if (statusCode == 200) {
    showSnackbar(t("Your password has been reset"), { color: "success" });
    router.push({ name: "login" });
  } else if (statusCode == 422) {
    errors.value = data.errors;
    showSnackbar(data.message ?? t("please fix errors"), { color: "error" });
  } else {
    showSnackbar(t("try again in a few seconds"), { color: "error" });
  }

  isLoading.value = false;
}
</script>

<template>
  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="441"
            :src="imageVariant"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg class="auth-footer-mask" :src="authThemeMask" />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface))"
    >
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
        <VCardText>
          <VNodeRenderer :nodes="themeConfig.app.logo" class="mb-6" />
          <h5 class="text-h5 mb-1">{{ typeMessage }}</h5>
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
                  v-model="form.email"
                  label="Email"
                  type="email"
                  readonly
                  placeholder="johndoe@email.com"
                  :error-messages="errors?.email"
                  v-if="form.type=='Password_forgotten'"
                />
              </VCol>

              <!-- password -->
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :rules="[requiredValidator, passwordValidator(form.password)]"
                  :label="$t('Change PWD.Password')"
                  :placeholder="$t('Change PWD.Password')"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  autocomplete="one-time-code"
                  :error-messages="errors?.password"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password_confirmation"
                  :rules="[
                    requiredValidator,
                    confirmedValidator(
                      form.password_confirmation,
                      form.password
                    ),
                  ]"
                  :label="$t('Change PWD.Conf Password')"
                  :placeholder="$t('Change PWD.Conf Password')"
                  autocomplete="one-time-code"
                  :type="isPasswordConfirmVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordConfirmVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :error-messages="errors?.password_confirmation"
                  @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
                />
              </VCol>
              <VCol cols="12">
                <VBtn
                  class="mt-5"
                  block
                  type="submit"
                  :disabled="isLoading"
                  :loading="isLoading"
                >
                  {{ $t("Change PWD.Confirm") }}
                </VBtn>
              </VCol>

              <!-- <VCol cols="12" class="text-center text-base">
                <RouterLink class="text-primary ms-2" :to="{ name: 'login' }">
                  {{ $t("Login") }}
                </RouterLink>
              </VCol> -->
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
