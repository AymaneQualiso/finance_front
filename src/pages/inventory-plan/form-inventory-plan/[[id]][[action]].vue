<template>
  <VCard :title="$t('InvPlanMd.Inventory Plan')">
    <template #append>
      <VBtn
        color="secondary"
        variant="tonal"
        class="me-3"
        @click="redirectToList"
      >
        <VIcon
          color="secondary"
          icon="tabler-arrow-back"
          size="28"
        />
      </VBtn>
      <VBtn
        v-if="$route.params.action != 'show'"
        :disabled="isLoading"
        @click="addInventoryPlan"
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
            v-model="form.name"
            :label="$t('Name')"
            :placeholder="$t('Name')"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="form.start_at"
            :label="$t('Start at')"
            :placeholder="$t('Start at')"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppDateTimePicker
            v-model="form.end_at"
            :label="$t('End at')"
            :placeholder="$t('End at')"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppCombobox
            v-model="form.status"
            :items="['Planifie', 'Ouvert', 'Clôturé']"
            :placeholder="$t('Status')"
            :label="$t('Status')"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppCombobox
            v-model="form.responsible_id"
            :items="users"
            :placeholder="$t('Name')"
            item-title="name"
            :label="$t('InvPlanMd.Responsible')"
            :loading="isLoading"
            item-value="id"
            :rules="[requiredValidator]"
          />
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>

<script setup>
import { useInventoryPlansStore, useUserStore } from "@/stores"
import { isEmpty } from "lodash"
import { storeToRefs } from "pinia"
  
definePage({ meta: { navActiveLink: "inventory-plan-list" } })
  
const router = useRouter()
const route = useRoute()
const t = inject("t")
const storeInventoryPlans = useInventoryPlansStore()
const userStore = useUserStore()

// const user_group
const { users } = storeToRefs(userStore)
const { currentInventoryPlan, isLoading } = storeToRefs(storeInventoryPlans)

const form = ref({})
const dataForm = ref(null)
const isSnackbarVisible = ref(false)
const snackbarMessage = ref("")

onMounted(async () => {

  if(isEmpty(users.value))
    userStore.getUsers()
  
  if (route.params.id) {
    if (isEmpty(currentInventoryPlan.value)) {
      await storeInventoryPlans.getInventoryPlan(route.params.id)
    }

    form.value = currentInventoryPlan.value
  }
})

function addInventoryPlan() {
  dataForm.value.validate().then(async ({ valid }) => {
    if (!valid) return

    form.value.responsible_id = form.value.responsible_id?.id
      ? form.value.responsible_id?.id
      : form.value.responsible_id


    if (!route.params.id) {
      const res = await storeInventoryPlans.addInventoryPlan(form.value)
      if (res) {
        dataForm.value.reset()
        isSnackbarVisible.value = true
        snackbarMessage.value = t('Added ok', { model: t('InvPlanMd.Inventory Plan') })
        redirectToList()
      }
    } else if (route.params.id) {
      form.value.id = route.params.id

      const res = await storeInventoryPlans.updateInventoryPlan(form.value)
      if (res) {
        dataForm.value.reset()
        isSnackbarVisible.value = true
        snackbarMessage.value = t('Updated ok', { model: t('InvPlanMd.Inventory Plan') })
        redirectToList()
      }
      
    }
  })
}
  
function redirectToList() {
  router.push({ name: "inventory-plan-list" })
}
  
onBeforeUnmount(() => {
  currentInventoryPlan.value = {}
})
</script>
  