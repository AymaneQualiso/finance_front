
  
export const usePermissionStore = defineStore("permission", () => {
  const rolePermissions = ref([])
  const directPermissions = ref([])
  const isPermissionsLoading= ref(false)
  const total = ref(0)
  
  async function fetchRolePermissions() {
    isPermissionsLoading.value = true
  
    const { data, statusCode } = await useApi("roles/permissions").get()
  
    rolePermissions.value = statusCode.value == 200 ? data.value?.data : []
    isPermissionsLoading.value = false
  }

  async function fetchDirectPermissions() {
    isPermissionsLoading.value = true
  
    const { data, statusCode } = await useApi("roles/permissions?group_name=direct_permissions").get()
  
    directPermissions.value = statusCode.value == 200 ? data.value?.data : []

    isPermissionsLoading.value = false
  }
  
  return {
    rolePermissions,
    fetchRolePermissions,
    directPermissions,
    fetchDirectPermissions,
    isPermissionsLoading,
    total,
  }
})
  