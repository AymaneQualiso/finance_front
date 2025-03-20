<template>
  <HeadInventoryPlanDetails 
    v-if="$route.params.action == 'show'" 
    :inventory-plan="currentInventoryPlan"
  />
  <VCard v-else>
    <template #title>
      <div class="d-flex align-center gap-2">
        {{ $t('InvPlanMd.Inventory Plan') }}
        <BtnAttachments 
          v-if="$route.params.action == 'edit'" 
          with-text
          with-form
          model="inventory_plans"
          :model-able="modelAble"
          @on-upload-file="uploadAttachment"
          @on-delete="deleteAttachment"
          @on-download-file="downloadAttachment"
        />
      </div>
    </template>
    <template #append>
      <VBtn
        color="secondary"
        variant="tonal"
        class="me-3"
        @click="redirectToBack"
      >
        <VIcon
          color="secondary"
          icon="tabler-arrow-back"
          size="28"
        />
      </VBtn>
      <VBtn
        v-if="$route.params.action != 'show' && ($can('inventory_plans.store') || $can('inventory_plans.update'))"
        :disabled="isLoading"
        @click="addInventoryPlan(dataForm, currentInventoryPlan)"
      >
        {{ $t('Confirm') }}
      </VBtn>
    </template>
    <VForm
      ref="dataForm"
      class="px-6 py-6"
      :readonly="$route.params.action === 'show'"
    >
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="currentInventoryPlan.name"
            class="required"
            :label="$t('Name')"
            :placeholder="$t('Name')"
            :rules="[requiredValidator]"
            @input="isGenerated = false"
          >
            <template #append-inner>
              <TooltipIcon
                :tooltip-text="$t('InvPlanMd.generate name')"
                icon="tabler-refresh"
                @click="generateName"
              />
            </template>
          </AppTextField>
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppCombobox
            v-model="currentInventoryPlan.status"
            class="required"
            :items="getEnums(enums.inventoryStatus, $t)"
            :placeholder="$t('Status')"
            :label="$t('Status')"
            :rules="[requiredValidator]"
            item-title="title"
            item-value="key"
            :error-messages="appComboboxErrorMessages(getEnums(enums.inventoryStatus, $t), $t, $t('Status'))"
            :disabled="!getEnums(enums.inventoryStatus, $t).length"
            :return-object="false"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="currentInventoryPlan.start_at"
            classes="required"
            :label="$t('Start at')"
            :placeholder="$t('Start at')"
            :config="allowedStartDates"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="currentInventoryPlan.end_at"
            classes="required"
            :label="$t('End at')"
            :placeholder="$t('End at')"
            :config="allowedEndDates"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppCombobox
            v-model="currentInventoryPlan.responsible_id"
            class="required"
            :items="users"
            :placeholder="$t('Name')"
            item-title="name"
            :label="$t('InvPlanMd.Responsible')"
            :loading="isLoading"
            item-value="id"
            :rules="[requiredValidator]"
            :disabled="!users.length"
            :error-messages="appComboboxErrorMessages(users, $t, $t('InvPlanMd.Responsible'))"
          />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <AppCombobox
            v-model="currentInventoryPlan.accountant_id"
            :items="accountantUsers"
            :placeholder="$t('Name')"
            item-title="name"
            :label="$t('InvPlanMd.Accountant')"
            item-value="id"
            :disabled="!users.length"
            :return-object="false"
            :error-messages="appComboboxErrorMessages(users, $t, $t('InvPlanMd.Accountant'))"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VSwitch
            v-model="currentInventoryPlan.add_new_product"
            :label="$t('InvPlanMd.Can add new product') + ' : ' + (currentInventoryPlan.add_new_product ? $t('InvPlanMd.Yes') : $t('InvPlanMd.No'))"
            :false-value="0"
            :true-value="1"
            hide-details
          />
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>

<script setup>
import { useInventoryPlan } from "@/composables/inventoryPlan"
import { useInventoryPlansStore } from "@/stores"
import HeadInventoryPlanDetails from "@/views/inventory-plan/HeadInventoryPlanDetails.vue"
import { cloneDeep, isEmpty } from "lodash"

definePage({ meta: { navActiveLink: "inventory-plan-list" } })

const t = inject('t')
const showSnackbar = inject('showSnackbar')
const storeInventoryPlans = useInventoryPlansStore()
const { currentInventoryPlan } = storeToRefs(storeInventoryPlans)
const dataForm = ref(null)
const isGenerated = ref(true)

function generateName() {
  isGenerated.value = true
  currentInventoryPlan.value.name = `Plan inventaire -  ${currentInventoryPlan.value?.start_at ?? ''}`
}

watch(() => cloneDeep(currentInventoryPlan.value),
  (currentValue, oldValue) => {
    if(currentValue.name === oldValue.name && isGenerated.value)
      generateName()
  }, { deep: true })

const { 
  modelAble,
  route,
  isLoading,
  users,
  enums,
  getData,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  redirectToBack,
  addInventoryPlan,
} = useInventoryPlan(t, showSnackbar)

const accountantUsers= computed(()=> users.value?.filter( user => user.roles?.some(role => role.name === 'accountant')))

onMounted(async () => {
  getData()
  
  if (route.params.id) {
    isGenerated.value = false
    if (isEmpty(currentInventoryPlan.value)) {
      await storeInventoryPlans.getInventoryPlan(route.params.id)
    }
    modelAble.value.id = currentInventoryPlan.value.id
  }
})

const allowedStartDates = computed(() => {
  return {
    maxDate: currentInventoryPlan.value.end_at,
  }
})

const allowedEndDates = computed(() => {
  return {
    minDate: currentInventoryPlan.value.start_at,
  }
})
</script>
  