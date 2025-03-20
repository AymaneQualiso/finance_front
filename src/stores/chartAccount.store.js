import { map as _map } from "lodash";

export const useChartAccountStore = defineStore("chart-account", () => {
  const selectedChartAccount = ref({});
  const selectedOriginChartAccount = ref({});
  const class1List = ref([]);
  const class2List = ref([]);
  const class3List = ref([]);
  const chartAccounts = ref([]);
  const isChartAccountsLoading = ref(false);
  const isChartAccountLoading = ref(false);
  const isDownloadingExport = ref(false);
  const total = ref(0);
  const totalClass1 = ref(0);
  const totalClass2 = ref(0);
  const totalClass3 = ref(0);
  const filters = ref({});
  const toBeEditedClass = ref({});
  const isEditMode = ref(false);

  

  
  async function getChartAccount(id, ...payload) {
    try {
      isChartAccountLoading.value = true;
  
     
      if (payload) filters.value = Object.assign({}, filters.value, ...payload);
  
      let query = getQuery(filters.value);

      query = query.startsWith('?') ? query.slice(1) : query;
    
      const { data } = await useApi(`chartAccounts/${id}${query}`).get();
      const [class1Response, class2Response, class3Response] = await Promise.all([
        useApi(`class1?chart_account_id=${id}&${query}`).get(),
        useApi(`class2?chart_account_id=${id}&${query}`).get(),
        useApi(`class3?chart_account_id=${id}&${query}`).get(),
      ]);
      selectedChartAccount.value = data?.value?.data;
      selectedOriginChartAccount.value = { ...data?.value?.data };
      isChartAccountLoading.value = false;

      class1List.value = class1Response.data?.value?.data || [];
      totalClass1.value = class1Response.data?.value?.total || 0;
  
      class2List.value = class2Response.data?.value?.data || [];
      totalClass2.value = class2Response.data?.value?.total || 0;
  
      class3List.value = class3Response.data?.value?.data || [];
      totalClass3.value = class3Response.data?.value?.total || 0;
  
     
    } catch (error) {
      console.error("Error fetching chart account data:", error);
    } finally {
      isChartAccountLoading.value = false;
    }
  }
  

  async function fetchChartAccounts(queryParams = {}) {
    let query = getQuery(queryParams);

    const { data, statusCode } = await useApi(`chartAccounts${query}`).get();

    chartAccounts.value = data.value?.data;

    return { statusCode: statusCode.value, data: data.value };
  }

  async function getDTchartAccounts(...payload) {
    isChartAccountsLoading.value = true;
    if (payload) filters.value = Object.assign({}, filters.value, ...payload);

    const { data } = await fetchChartAccounts(filters.value);

    chartAccounts.value = data?.data;
    total.value = data?.meta?.total;
    isChartAccountsLoading.value = false;
  }

  async function exportChartAccounts(ids) {
    isDownloadingExport.value = true;
    filters.value = { ...filters.value, ...ids };
    // export data with filters
    let query = getQuery(filters.value);
    const { data, statusCode } = await useApi(
      `chartAccounts/export${query}`
    ).blob();

    if (statusCode.value === 200) {
      download(data.value, 'plans-comptable.xlsx',
        { type: 'application/vnd.ms-excel' }
      ).click();
    }

    isDownloadingExport.value = false;
  }

  async function getChartAccounts(params = {}) {
    isChartAccountsLoading.value = true;

    params = { per_page: 100, ...params };

    const { data } = await fetchchartAccounts(params);

    chartAccounts.value = data?.data;
    total.value = data?.meta?.total;
    isChartAccountsLoading.value = false;
  }

  async function addChartAccount(payload) {
    isChartAccountLoading.value = true;

    const { data, statusCode } = await useApi(`chartAccounts`).post(payload);

    isChartAccountLoading.value = false;

    return { statusCode: statusCode.value, data: data.value };
  }

  async function updateChartAccount(id, payload) {
    isChartAccountLoading.value = true;

    const { data, statusCode } = await useApi(`chartAccounts/${id}`).put(
      payload
    );

    if (statusCode.value == 200) {
      selectedOriginChartAccount.value = data.value.data
    }

    isChartAccountLoading.value = false;

    return { statusCode: statusCode.value, data: data.value };
  }

  function reset(stateVar = "all") {
    if (stateVar == "all" || stateVar?.includes("selectedChartAccount"))
      selectedChartAccount.value = {};
      selectedOriginChartAccount.value = {};
    if (stateVar == "all" || stateVar?.includes("chartAccounts"))
      chartAccounts.value = [];
    if (stateVar == "all" || stateVar?.includes("total")) total.value = 0;
    if (stateVar == "all" || stateVar?.includes("filters")) filters.value = {};
    if (stateVar == "all" || stateVar?.includes("isChartAccountLoading"))
      isChartAccountLoading.value = false;
    if (stateVar == "all" || stateVar?.includes("isChartAccountsLoading"))
      isChartAccountsLoading.value = false;
  }

  return {
    // states
    selectedOriginChartAccount,
    selectedChartAccount,
    chartAccounts,
    isChartAccountsLoading,
    isChartAccountLoading,
    total,
    filters,
    class1List,
    class2List,
    class3List,
    totalClass1,
    totalClass2,
    totalClass3,
    toBeEditedClass,
    isEditMode,
    isDownloadingExport,

    // actions
    fetchChartAccounts,

    getChartAccount,
    getDTchartAccounts,
    getChartAccounts,
    addChartAccount,
    updateChartAccount,
    reset,
    exportChartAccounts,
  };
});
