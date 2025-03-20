<template>
  <VCard
    :title="`Rôle ${t(selectedRole?.name ?? '')}`"
    :loading="isRoleLoading || isPermissionsLoading"
  >
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
        :disabled="isRoleLoading || isPermissionsLoading"
        @click="submit"
      >
        {{t('Confirm')}}
      </VBtn>
    </template>
    <VCard
      :disabled="isRoleLoading"
      variant="flat"
    >
      <VRow
        v-for="(permissions, title) in rolePermissions"
        :key="title"
        class="px-6 py-6"
      >
        <PermissionItem
          v-if="title"
          :permissions="permissions"
          :title="title"
        />
        <VDivider class="my-2" />
      </VRow>
    </VCard>
  </VCard>
</template>

<script setup>
import { usePermissionStore, useRoleStore } from "@/stores"
import PermissionItem from "./PermissionItem.vue"

const roleStore = useRoleStore()
const permissionStore = usePermissionStore()
const { isRoleLoading, selectedRole } = storeToRefs(roleStore)
const { isPermissionsLoading, rolePermissions } = storeToRefs(permissionStore)
const t = inject("t");
const router = useRouter()
const route = useRoute()
const showSnackbar = inject('showSnackbar')

definePage({
  meta: { 
    navActiveLink: "settings-roles", 
    permission: "roles.update",
  }, 
})

onMounted(async () => {
  roleStore.getRole(route.params?.role)

  if(isEmpty(rolePermissions.value)) permissionStore.fetchRolePermissions()
})

async function submit() {
  const statusCode = await roleStore.updatePermissions(route.params?.role)

  if(statusCode == 200) {
    showSnackbar(t("role updated with successfully"), { color: "success" })
  } else {
    showSnackbar(t("error updating"), { color: "error" })
  }
}

async function redirectToList() {
  await router.push({ name: "settings-roles" })
}

onBeforeUnmount(() => {
  roleStore.setRolePermissions([])
})
</script>
