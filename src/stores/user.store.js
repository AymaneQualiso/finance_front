import { cloneDeep, forEach, isArray, map } from "lodash"
  
export const useUserStore = defineStore("user", () => {

    const user = ref({
      auth_status : "active", 
    })
  const users = ref([])
  const total = ref(0)
  const filters = ref({})
  const isUsersLoading = ref(false)
  const isUserLoading = ref(false)

  async function fetchUsers(queryParams = {}) {
    let query = getQuery(queryParams)
    
    const { data, statusCode } = await useApi(`users${query}`).get()

    users.value = data.value?.data

    return { statusCode: statusCode.value, data: data.value }
  }

  async function getDTUsers(...payload) {
    isUsersLoading.value = true
    if (payload) filters.value = Object.assign({}, filters.value, ...payload)
  
    const { data } = await fetchUsers(filters.value)
  
    users.value = data?.data
    total.value = data?.meta?.total
    isUsersLoading.value = false
  }
  
  async function getUsers(params = {}) {
    isUsersLoading.value = true

    params = { "per_page": 100, ...params }
  
    const { data } = await fetchUsers(params)
  
    users.value = data?.data
    total.value = data?.meta?.total
    isUsersLoading.value = false
  }

  
  async function getUser(id) {
    isUserLoading.value = true
  
    const { data, statusCode } = await useApi(`users/${id}`).get()
  
    user.value = data?.value?.data
    isUserLoading.value = false
    
    return { statusCode: statusCode.value, data: data.value }
  }

  const getPayload = () => {
    const userData = cloneDeep(user.value);
    
    // Convert roles to a single value instead of an array
    userData.roles = userData.roles ? userData.roles : '';
  
    const formData = new FormData();
    forEach(userData, (value, key) => {
      formData.append(key, value ?? '');
    });
  
    return formData;
  };
  

  async function addUser() {
    isUserLoading.value = true

    const formData = await getPayload()
  
    const { data, statusCode } = await useApi(`users`, { 
      headers: {
        "Content-Type": null,
      }, 
    }).post(formData)
  
    isUserLoading.value = false
      
    return { statusCode: statusCode.value, data: data.value }
  }

  async function updateUser() {
    isUserLoading.value = true

    const formData = await getPayload()

    formData.append("_method", "PUT")

    const { data, statusCode } = await useApi(`users/${user.value.id}`, {
      headers: {
        "Content-Type": null,
      },
    }).post(formData)
  
    isUserLoading.value = false
      
    return { statusCode: statusCode.value, data: data.value }
  }

  async function deleteUser(id) {
    isUserLoading.value = true
  
    const { data, statusCode } = await useApi(`users/${id}`).delete()
  
    isUserLoading.value = false
      
    return { statusCode: statusCode.value, data: data.value }
  }

  async function updateUserProfile() {
    isUserLoading.value = true

    const formData = new FormData()
    formData.append("nom", user.value.nom)
    formData.append("prenom", user.value.prenom)
    formData.append("phone", user.value.phone)
    
    if (user.value.avatar) {
      formData.append("avatar", isArray(user.value.avatar) ? JSON.stringify(user.value.avatar) : user.value.avatar)
    }

    const { data, statusCode } = await useApi(`users/updateUserProfile/${user.value.id}`, {
        headers: {
          "Content-Type": null,
        },
      }).post(formData)

    isUserLoading.value = false
    
    return { statusCode: statusCode.value, data: data.value }
  }

  async function updatePassword(payload) {
    const { data, statusCode } = await useApi(`users/update_password_first_time`).post(payload)
    return { data: data.value, statusCode: statusCode.value }
  }

  async function setConnectedSociete(req) {
    const { data, statusCode } = await useApi(`users/setConnectedSociete`).post(req)
    return statusCode.value === 200
  }

  async function getAllUsers() {
    const { data } = await useApi(`users/getAllUsers`).get();
    return data.value
  }
  /**
   * 
   * @param {stateVar} stateVar if null reset all vars to default
   */
  function reset(stateVar = 'all') {
    if(stateVar == 'all' || stateVar?.includes('user')) user.value = {}
    if(stateVar == 'all' || stateVar?.includes('users')) users.value = []
    if(stateVar == 'all' || stateVar?.includes('total')) total.value = 0
    if(stateVar == 'all' || stateVar?.includes('filters')) filters.value = {}
    if(stateVar == 'all' || stateVar?.includes('isUserLoading')) isUserLoading.value = false
    if(stateVar == 'all' || stateVar?.includes('isUsersLoading')) isUsersLoading.value = false
  }
  
  return {
    user,
    getUser,
    addUser,
    updateUser,
    deleteUser,
    isUserLoading,

    users,
    getUsers,
    getDTUsers,
    total,
    filters,
    isUsersLoading,
    updateUserProfile,
    updatePassword,
    reset,
    setConnectedSociete,
    getAllUsers
  }
})
  