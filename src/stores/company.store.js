import { cloneDeep, forEach, isArray, map } from "lodash"
  
export const useCompanyStore = defineStore("company", () => {
  const company = ref({})
  const companies = ref([])
  const total = ref(0)
  const page = ref(0)
  const filters = ref({})
  const isExportingCompanies = ref(false)
  const isCompaniesLoading = ref(false)
  const isCompanyLoading = ref(false)
  const connectedCompany = ref({})
  const showModalCompanies = ref(false)
  const userCompanies = ref([])

  async function fetchCompanies(queryParams = {}) {
    let query = getQuery(queryParams)
    
    const { data, statusCode } = await useApi(`companies${query}`).get()

    companies.value = data.value?.data

    return { statusCode: statusCode.value, data: data.value }
  }

  async function getDTCompanies(...payload) {
    isCompaniesLoading.value = true
    if (payload) filters.value = Object.assign({}, filters.value, ...payload)
  
    const { data } = await fetchCompanies(filters.value)
  
    companies.value = data?.data
    total.value = data?.meta?.total
    page.value = data?.meta?.current_page
    isCompaniesLoading.value = false
  }
  
  async function getCompanies(params = {}) {
    isCompaniesLoading.value = true

    params = { "per_page": 100, ...params }
  
    const { data } = await fetchCompanies(params)
  
    companies.value = data?.data
    total.value = data?.meta?.total
    page.value = data?.meta?.current_page
    isCompaniesLoading.value = false
  }

  async function getOnlyActiveCompanies() {
    const { data, statusCode } = await useApi('companies/getOnlyActiveCompanies').get()
console.log('active comp', data.value);

    companies.value = data.value

    return statusCode.value === 200 
  }
  
  async function getCompany(id) {
    isCompanyLoading.value = true
  
    const { data, statusCode } = await useApi(`companies/${id}`).get()
  
    company.value = data?.value?.data
    isCompanyLoading.value = false
    
    return { statusCode: statusCode.value, data: data.value }
  }

  function getPayload() {
    const companyData = cloneDeep(company.value)
    const formData = new FormData()
    forEach(companyData, (value, key) => {
      formData.append(key, isArray(value) ? JSON.stringify(value) : value)
    })
    return formData
  }

  async function addCompany() {
    isCompanyLoading.value = true

    const formData = await getPayload()
  
    const { data, statusCode } = await useApi(`companies`, { 
      headers: {
        "Content-Type": null,
      }, 
    }).post(formData)
  
    isCompanyLoading.value = false
      
    return { statusCode: statusCode.value, data: data.value }
  }

  async function updateCompany() {
    isCompanyLoading.value = true

    const formData = await getPayload()

    formData.append("_method", "PUT")

    const { data, statusCode } = await useApi(`companies/${company.value.id}`, {
      headers: {
        "Content-Type": null,
      },
    }).post(formData)
  
    isCompanyLoading.value = false
      
    return { statusCode: statusCode.value, data: data.value }
  }

  async function deleteCompany(id) {
    isCompanyLoading.value = true
  
    const { data, statusCode } = await useApi(`companies/${id}`).delete()

    if (statusCode.value === 200) {
      this.getDTCompanies()
    }
  
    isCompanyLoading.value = false
      
    return { statusCode: statusCode.value, data: data.value }
  }

  async function exportList(ids) {
    filters.value = { ...filters.value, ...ids };

    let query = getQuery(filters.value);

    isExportingCompanies.value = true

    const { data, statusCode } = await useApi(`companies/export${query}`).blob();

    if(statusCode.value === 200) {
      download(data.value, `Companies.xlsx`, { type: 'application/vnd.ms-excel' }).click()
    }

    isExportingCompanies.value = false
  }

  /**
   * 
   * @param {stateVar} stateVar if null reset all vars to default
   */
  function reset(stateVar = 'all') {
    if(stateVar == 'all' || stateVar?.includes('company')) company.value = {}
    if(stateVar == 'all' || stateVar?.includes('companies')) companies.value = []
    if(stateVar == 'all' || stateVar?.includes('total')) total.value = 0
    if(stateVar == 'all' || stateVar?.includes('page')) page.value = 0
    if(stateVar == 'all' || stateVar?.includes('filters')) filters.value = {}
    if(stateVar == 'all' || stateVar?.includes('isCompanyLoading')) isCompanyLoading.value = false
    if(stateVar == 'all' || stateVar?.includes('isCompaniesLoading')) isCompaniesLoading.value = false
  }
  
  return {
    company,
    getCompany,
    addCompany,
    updateCompany,
    deleteCompany,
    isCompanyLoading,
    isExportingCompanies,
    getOnlyActiveCompanies,
    companies,
    getCompanies,
    getDTCompanies,
    total,
    page,
    filters,
    isCompaniesLoading,
    showModalCompanies,
    connectedCompany,
    userCompanies,
    exportList,
    reset,
  }
})
  