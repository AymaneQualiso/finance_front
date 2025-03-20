<template>
  <VCard :loading="isCompanyLoading" :title="t('company.company')">
    <template #append>
      <VBtn
        color="secondary"
        variant="tonal"
        class="me-3"
        @click="redirectToForm('companies', 'list', null, null)"
        :disabled="isCompanyLoading"
      >
        <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
      </VBtn>
      <VBtn
        v-if="
          ($can('companies.store') || $can('companies.update')) &&
          $route.name != 'companies-show'
        "
        :disabled="isCompanyLoading"
        :loading="isCompanyLoading"
        :text="$t('Confirm')"
        @click="onFormSubmit"
      >
      </VBtn>
    </template>
    <VForm
      ref="refForm"
      class="px-6 py-6"
      :readonly="$route.name == 'companies-show'"
      :disabled="isCompanyLoading"
      @submit.prevent="onFormSubmit"
    >
      <VRow v-if="isLoad">
        <VProgressLinear
          v-if="isLoad"
          color="primary"
          rounded
          indeterminate
          height="2"
        />
      </VRow>
      <VRow v-else>
        <VCol cols="12" md="3">
          <AppTextField
            v-model.trim="company.label"
            :placeholder="$t('label')"
            :label="$t('label')"
            :rules="[requiredValidator]"
            class="required"
            :error-messages="errors?.label"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppTextField
            v-model.trim="company.abv"
            :placeholder="$t('abv')"
            :label="$t('abv')"
            :rules="[requiredValidator]"
            class="required"
            maxlength="3"
            :error-messages="errors?.abv"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppCombobox
            v-model="company.is_active"
            :label="$t('is_active')"
            :placeholder="$t('is_active')"
            :items="getEnums(enums.isActive, $t)"
            item-title="title"
            item-value="key"
            :rules="[requiredValidator]"
            class="required"
            :return-object="false"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppTextField
            v-model.trim="company.capital"
            :label="$t('company.capital')"
            :placeholder="$t('company.capital')"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="12">
          <VSelect
            v-model="company.usersIds"
            multiple
            chips
            closable-chips
            :label="$t('users')"
            :placeholder="$t('users')"
            :items="users"
            item-title="name"
            item-value="id"
            :rules="[requiredValidator]"
            class="required"
            :return-object="false"
            :loading="isCompanyLoading"
            :error-messages="
              appComboboxErrorMessages(users, $t, $t('company.users'))
            "
            :clearable="false"
          />
        </VCol>
        <br>
        <!-- <VCol cols="12" md="6">
          <VSelect
            v-model="company.company_group_id"
            :placeholder="$t('company.company_group')"
            :label="$t('company.company_group')"
            :items="companyGroups"
            item-title="label"
            item-value="id"
            :return-object="false"
            :loading="isCompanyLoading"
            :error-messages="
              appComboboxErrorMessages(
                companyGroups,
                $t,
                $t('company.company_groups')
              )
            "
          />
        </VCol> -->
        <VCol cols="12" md="4">
          <AppCombobox
            v-model="company.ice"
            type="number"
            :label="$t('company.ice')"
            :placeholder="$t('company.ice')"
            :rules="[
              requiredValidator,
              numericValidator,
              lengthValidator(company.ice, 15),
            ]"
            :loading="isCompanyLoading"
            class="required"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppTextField
            v-model="company.idf"
            type="number"
            :label="$t('company.idf')"
            :placeholder="$t('company.idf')"
            :rules="[
              requiredValidator,
              numericValidator,
              lengthValidator(company.idf, 8, 6),
            ]"
            class="required"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppTextField
            v-model="company.patente"
            type="number"
            :label="$t('company.patente')"
            :placeholder="$t('company.patente')"
            :loading="isCompanyLoading"
            :rules="[numericValidator]"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppTextField
            v-model="company.cnss"
            type="number"
            :label="$t('company.cnss')"
            :placeholder="$t('company.cnss')"
            :loading="isCompanyLoading"
            :rules="[numericValidator]"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppCombobox
            v-model="company.rc"
            type="number"
            :label="$t('company.rc')"
            :placeholder="$t('company.rc')"
            :loading="isCompanyLoading"
            :rules="[numericValidator]"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppTextField
            v-model.trim="company.city_rc"
            :label="$t('company.city_rc')"
            :placeholder="$t('company.city_rc')"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="8">
          <AppTextField
            v-model.trim="company.adresse"
            :label="$t('company.address')"
            :placeholder="$t('company.address')"
            :loading="isCompanyLoading"
          />
        </VCol>
        <VCol cols="12" md="4">
          <AppTextField
            v-model.trim="company.city"
            :label="$t('company.city')"
            :placeholder="$t('company.city')"
            :loading="isCompanyLoading"
          />
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>

<script setup>
import { useCompany } from "@/composables/company.js";

const t = inject("t");
const showSnackbar = inject("showSnackbar");
const {
  isLoad,
  companyStore,
  companies,
  isCompaniesLoading,
  isCompanyLoading,
  company,
  enums,
  users,
  companyGroups,
  refForm,
  redirectToForm,
  onFormSubmit,
  getData,
} = useCompany(t, showSnackbar);

onMounted(() => {
  getData();
});
</script>
