
import {
  map as _map,
} from "lodash"

export const useRoleStore = defineStore("role", () => {
  const selectedRole = ref({})
  const roles = ref([])
  const isRolesLoading= ref(false)
  const isRoleLoading = ref(false)
  const total = ref(0)
  const filters = ref({})
  const rolePermissions = ref([])
  const t = inject("t")


  function setRolePermissions(permissions) {
    rolePermissions.value = permissions ?? []
  }

  async function getRole(id) {
    isRoleLoading.value = true

    const { data } = await useApi(`roles/${id}`).get()

    selectedRole.value = data?.value?.data
    setRolePermissions(data?.value?.data.permissions ?? [])
    isRoleLoading.value = false
  }

  
  async function fetchRoles(queryParams = {}) {
    let query = getQuery(queryParams)
    
    const { data, statusCode } = await useApi(`roles${query}`).get()

    roles.value = data.value?.data

    return { statusCode: statusCode.value, data: data.value }
  }

  async function getDTRoles(...payload) {
    isRolesLoading.value = true
    if (payload) filters.value = Object.assign({}, filters.value, ...payload)

    const { data } = await fetchRoles(filters.value)
  
    roles.value = data?.data
    total.value = data?.meta?.total
    isRolesLoading.value = false
  }
  
  async function getRoles(params = {}) {
    isRolesLoading.value = true

    params = { "per_page": 100, ...params }
  
    const { data } = await fetchRoles(params)
  
    roles.value = data?.data
    total.value = data?.meta?.total
    isRolesLoading.value = false
  }

  async function updatePermissions(id) {
    isRoleLoading.value = true

    const { statusCode } = await useApi(`roles/${id}`).put({
      permissions: _map(rolePermissions.value, ({ name }) => name),
    })

    isRoleLoading.value = false
    
    return statusCode.value
  }

  async function addOrDuplicateRole(payload, duplicateRole = false) {
    isRoleLoading.value = true
 
    const slug = duplicateRole ? `/${payload?.role.id}/duplicate` : ''

    const { data, statusCode } = await useApi(`roles${slug}`).post(payload)
    

    isRoleLoading.value = false
    
    return { statusCode: statusCode.value, data: data.value }
  }

  function reset(stateVar = 'all') {
    if(stateVar == 'all' || stateVar?.includes('selectedRole')) selectedRole.value = {}
    if(stateVar == 'all' || stateVar?.includes('roles')) roles.value = []
    if(stateVar == 'all' || stateVar?.includes('total')) total.value = 0
    if(stateVar == 'all' || stateVar?.includes('filters')) filters.value = {}
    if(stateVar == 'all' || stateVar?.includes('isRoleLoading')) isRoleLoading.value = false
    if(stateVar == 'all' || stateVar?.includes('isRolesLoading')) isRolesLoading.value = false
  }

  return {
    // states
    selectedRole,
    roles,
    rolePermissions,
    isRolesLoading,
    isRoleLoading,
    total,
    filters,

    // actions
    getRole,
    getDTRoles,
    getRoles,
    setRolePermissions,
    updatePermissions,
    addOrDuplicateRole,

    reset,
  }
})
