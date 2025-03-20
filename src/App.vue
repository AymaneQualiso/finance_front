<script setup>
import SnackBar from "@/plugins/snackbar/SnackBar.vue";
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@layouts/utils";
import { useTheme } from "vuetify";
import { useCompanyStore } from "./stores";
import { useInactivityLogout } from "@/composables/useInactivityLogout";

// useInactivityLogout();

const companyStore = useCompanyStore();

const { global } = useTheme();
const { showModalCompanies } = storeToRefs(companyStore);

// ℹ️ Sync current theme with initial loader theme
initCore();
initConfigStore();

const configStore = useConfigStore();
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
    >
      <RouterView />
      <SnackBar />
      <ScrollToTop />
      <SelectConnectedCompanyDialog v-if="showModalCompanies" />
    </VApp>
  </VLocaleProvider>
</template>
<style>
.v-theme--light .logo-light{
  display: none;
}

.v-theme--dark .logo-dark{
  display: none;
}
</style>
