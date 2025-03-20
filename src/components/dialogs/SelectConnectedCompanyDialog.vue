<template>
  <VDialog
    v-model="isDialogVisible"
    width="400"
    max-height="400"
    persistent
  >
    <VCard title="Choisir une société">
      <template #text>
        <div class="d-flex flex-column gap-4">
          <VChip color="error" v-if="userCompanies.length == 0">
            Aucune société n'a été trouvée !
          </VChip>
          <label v-if="userCompanies.length == 0"> Merci de contacter votre administrateur pour qu'il vous affecte à une société.</label>
          <VChip
            v-for="company in userCompanies"
            :key="company"
            color="primary"
            variant="outlined"
            size="x-large"
            :disabled="company.is_active === enums?.isActive?.INACTIVE"
            @click="chooseCompany(company)"
          >
            {{ company.label }}
          </VChip>
        </div>
      </template>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useAuthStore, useCompanyStore, useCoreStore, useUserStore } from '@/stores'

const coreStore = useCoreStore()
const userStore = useUserStore()
const companyStore = useCompanyStore()
const { companies, connectedCompany, showModalCompanies, userCompanies } = storeToRefs(companyStore)
const { enums } = storeToRefs(coreStore)
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)


// const isDialogVisible = computed(() => companies.value.length > 0 && user.value.id && showModalCompanies.value == true && !connectedCompany.value?.id && user.value.roles[0].id != 1)
const isDialogVisible = computed(() => showModalCompanies.value == true)

async function chooseCompany(company){
  let res = await userStore.setConnectedSociete({ id: user.value.id, selected_company_id: company.id })
  if (res) {
    connectedCompany.value = company
    showModalCompanies.value = false
    window.location.reload()
  }
}
</script>
