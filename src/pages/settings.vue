<template>
  <!-- {{ $route }} -->
  <VRow class="settings-container">
    <VCol cols="12" md="2">
      <VCard class="settings-card-1">
        <VList
          v-if="$can('settings.index')"
          density="compact"
          nav
          :style="{ maxHeight: '80vh', position: 'relative' }"
        >
          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <div class="searchClass">
              <AppTextField
                v-model="searchString"
                :placeholder="$t('search')"
                clearable
              />
            </div>
            <VDivider class="my-2" />
            <template v-for="item in searchingTabs" :key="item.title">
              <VListItem
                v-if="!item.permission || $can(item.permission + '.index')"
                :to="item.to"
                @click="item.onClick && item.onClick()"
                :class="{
                  'v-list-item--active':
                    $router.currentRoute.value.name.includes(item.parent),
                }"
              >
                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template v-if="item.badgeProps" #append>
                  <VBadge v-bind="item.badgeProps" />
                </template>
              </VListItem>
            </template>
          </PerfectScrollbar>
        </VList>
      </VCard>
    </VCol>
    <VCol cols="12" md="10">
      <RouterView />
    </VCol>
  </VRow>
</template>

<script setup>
const searchString = ref("");
const t = inject("t");

const settingsTabs = ref([
  {
    title: t("Settings Menu.General"),
    to: { name: "settings-general" },
    permission: "settings_general",
  },
  {
    title: t("Settings Menu.Users"),
    to: { name: "settings-users" },
    permission: "users",
  },
  {
    title: t("Settings Menu.Companies"),
    to: { name: "companies-list" },
    permission: "companies",
    parent: "companies",
  },
  {
    title: t("Settings Menu.Roles"),
    to: { name: "settings-roles" },
    permission: "roles",
  },
  {
    title: t("Settings Menu.References"),
    to: { name: "settings-references" },
    permission: "references",
  },
  {
    title: t("Settings Menu.accounting-plan"),
    to: { name: "accounting-plan-list" },
    permission: "chart_accounts",
    parent: "accounting-plan",
  },
  {
    title: t("Standards"),
    to: { name: "standare-parent" },
    permission: "standard",
    parent: "standare",
  },
  {
    title: t("Exercices"),
    to: { name: "Exercice-parent" },
    permission: "Exercices",
    parent: "Exercice",
  },

  {
    title: t("Settings Menu.account-types"),
    to: { name: "account-types-list" },
    permission: "account_types",
  },
  {
    title: t("Settings Menu.account-types-det"),
    to: { name: "account-types-det-list" },
    permission: "account_type_dets",
  },
  {
    title: t("Settings Menu.axis_types"),
    to: { name: "axis-type-list" },
    permission: "axis_types",
  },
  {
    title: t("Settings Menu.analytical_axies"),
    to: { name: "analytical-axies-list" },
    permission: "analytical_axies",
  },
  {
    title: t("Settings Menu.company_groups"),
    to: { name: "company-group-list" },
    permission: "company_groups",
  },
  {
    title: t("Settings Menu.groups"),
    to: { name: "group-list" },
    permission: "groups",
  },
  {
    title: t("Settings Menu.lockdown"),
    to: { name: "lockdown-list" },
    permission: "lockdowns",
  },
  // {
  //  title: t("Settings Menu.import-models"),
  //  to: { name: "import-models-list" },
  //  permission: "import_models",
  // },
  // {
    // title: t("Settings Menu.attachment_type"),
    // to: { name: "attachment-type-list" },
    // permission: "attachment_types",
  //},
  ]);
  
const searchingTabs = computed(() =>
  settingsTabs.value?.filter((tab) =>
    tab.title?.toUpperCase()?.match(searchString.value?.toUpperCase())
  )
);
</script>

<style lang="scss" scoped>
.settings-container {
  @media only screen and (min-width: 1000px) {
    & {
      position: relative;
    }

    .settings-card-1 {
      position: sticky;
      inset-block-start: 105px;
    }
  }

  .searchClass {
    position: sticky !important;
    z-index: 100;
    background-color: rgb(var(--v-theme-surface), 1);
    inset-block-start: 0;
  }
}
</style>
