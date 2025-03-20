<template>
  <VRow>
    <VCol cols="12" md="4">
      <UserDetails />
    </VCol>
    <VCol cols="12" md="8">
      <VTabs
        v-model="userTab"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.icon"
        >
          <VIcon
            :size="18"
            :icon="tab.icon"
            class="me-1"
          />
          <span>{{ t(tab.title) }}</span>
        </VTab>
      </VTabs>
  
        <VWindow
          v-model="userTab"
          class="mt-6 disable-tab-transition"
          :touch="false"
        >
          <VWindowItem>
            <userTabCompanies :companies-data="user.companies" />
          </VWindowItem>
  
          <VWindowItem>
            <UserUpdatePassword />
          </VWindowItem>
  
        </VWindow>
    </VCol>
  </VRow>

</template>

<script setup>
import UserDetails from "./userDetails.vue";
import userTabCompanies from "./userTabCompanies.vue";
import UserUpdatePassword from './UserUpdatePassword.vue';

const t = inject("t");
const showSnackbar = inject("showSnackbar");
definePage({
  meta: { 
    navActiveLink: "root",
  }, 
})
const {
  tabs,
  user,
  userTab,
  authStore,
  isUserLoading,
  isEditDialogVisible,
  handleUserUpdate,
} = useProfile(t, showSnackbar);

</script>
