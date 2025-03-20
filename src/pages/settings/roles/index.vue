<template>
  <VDialog
    v-model="isDialogVisible"
    persistent
    max-width="600"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn
      :disabled="isRoleLoading"
      @click="closeModal"
    />

    <!-- Dialog Content -->
    <VCard
      :title="t(dialogTitle)"
      :loading="isRoleLoading"
      :disabled="isRoleLoading"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <AppTextField
              v-model="roleName"
              :label="$t('label')"
              :placeholder="$t('label')"
              clearable
              :error-messages="errorMessage"
              class="required"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="closeModal"
        >
          {{ $t('Cancel') }}
        </VBtn>
        <VBtn @click="SubmitEvent">
          {{ $t('Confirm') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard
    class=""
    :title="$t('RoleModel.Roles')"
    v-if="$can('roles.index')"
  >
    <template #append>
      <VBtn
        color="primary"
        v-if="$can('roles.store')"
        @click="openModal('add')"
      >
        {{ $t('Add') }}
      </VBtn>
    </template>   
    <DataTableCore
      :headers="headers"
      :items="roles"
      :total="total"
      :per_page="10"
      :is-loading="isRolesLoading"
      :filter="filters"
      @change-filter="changeFilter"
    >
      <template #item.name="{ item }">
        {{ t(item.name) }}
      </template>
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('roles.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="$router.push({ name: 'settings-roles-edit-role', params: { role: item.id } })"
          />
          <TooltipIcon
            v-if="$can('roles.duplicate')"
            :tooltip-text="$t('RoleModel.duplicate-role')"
            icon="tabler-copy"
            color="info"
            @click="openModal('duplicate',item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useRoleStore } from "@/stores"

definePage({ meta: { navActiveLink: "settings-roles" } })

const roleStore = useRoleStore()
const { roles, isRolesLoading, isRoleLoading, total, filters } = storeToRefs(roleStore)
const isDialogVisible = ref(false)
const selectedRole = ref(null)
const action = ref("")
const roleName = ref("")
const errorMessage = ref("")
const showSnackbar = inject('showSnackbar')
const t = inject('t')

const dialogTitle = computed( () => {
  return selectedRole.value ? t("duplicate role")+`( ${t(selectedRole.value?.name)} )` : 'new role'
})

const headers = ref([
  {
    title: t("label"),
    sortable: true,
    key: "name",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: computed(() =>
      roleStore.roles.map((role) => ({
        key: role.name, 
        title: t(role.name), 
      }))
    ),
  },
  {
    title: t("Date"),
    sortable: true,
    key: "created_at",
    filtervalue: "",
    filterable: true,
    typefilter: "date",
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
])

onMounted(() => {
  roleStore.getDTRoles()
})

function changeFilter(...obj) {
  roleStore.getDTRoles(...obj)
}

function openModal(actionName, item = null) {
  action.value = actionName
  selectedRole.value = item
  isDialogVisible.value = true
}

function closeModal() {
  isDialogVisible.value = false
  roleName.value = null
  errorMessage.value = null
  action.value = ""
  selectedRole.value = null
}

async function SubmitEvent() {

  errorMessage.value = !!roleName.value ? null : t("the label is required")
  if(!roleName.value) return

  const payload = { name: roleName.value, role: selectedRole.value }

  const { statusCode, data } = await roleStore.addOrDuplicateRole(payload, action.value !== "add")

  if (statusCode == 201) {
    closeModal()
    roleStore.getDTRoles()
    showSnackbar(t("Rôle créé avec succès."), { color: "success" })
  } else {
    showSnackbar("Error: " + data?.message ?? "try again later", { color: "error" })
    errorMessage.value = data?.message
  }

  onBeforeUnmount(async () => {
    await roleStore.reset('roles')
  })
}
</script>

<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
