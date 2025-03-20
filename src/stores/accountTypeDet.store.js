import { map as _map } from "lodash";

export const useAccountTypeDetStore = defineStore("account-types-det", () => {
    const selectedAccountTypesDet = ref({});
    const accountTypesDets = ref([]);
    const isAccountTypesDetsLoading = ref(false);
    const isAccountTypesDetLoading = ref(false);
    const isLoadingImportAccountTypeDet = ref(false);
    const rowsError = ref(null);
    const isDownloadingExport = ref(false);
    const total = ref(0);
    const filters = ref({});
    const isEditMode = ref(false);

    async function getAccountTypesDet(id) {
        isAccountTypesDetLoading.value = true;

        const { data } = await useApi(`accountTypesDets/${id}`).get();

        selectedAccountTypesDet.value = data?.value?.data;
        isAccountTypesDetLoading.value = false;
    }

    async function fetchAccountTypesDets(queryParams = {}) {
        let query = getQuery(queryParams);

        const { data, statusCode } = await useApi(`accountTypesDets${query}`).get();

        accountTypesDets.value = data.value?.data;


        return { statusCode: statusCode.value, data: data.value };
    }

    async function getDTAccountTypesDets(...payload) {
        isAccountTypesDetsLoading.value = true;
        if (payload) filters.value = Object.assign({}, filters.value, ...payload);

        const { data } = await fetchAccountTypesDets(filters.value);
        accountTypesDets.value = data?.data;
        total.value = data?.meta?.total;
        isAccountTypesDetsLoading.value = false;
    }

    async function exportAccountTypesDets(ids) {
        isDownloadingExport.value = true;

        filters.value = { ...filters.value, ...ids };

        // export data with filters
        let query = getQuery(filters.value);
        const { data, statusCode } = await useApi(
            `accountTypesDets/export${query}`
        ).blob();

        if (statusCode.value === 200) {
            download(data.value, 'accountTypesDets.xlsx',
                { type: 'application/vnd.ms-excel' }
            ).click();
        }

        isDownloadingExport.value = false;
    }

    async function getAccountTypesDets(params = {}) {
        isAccountTypesDetsLoading.value = true;

        params = { per_page: 100, ...params };

        const { data } = await fetchAccountTypesDets(params);

        accountTypesDets.value = data?.data;
        total.value = data?.meta?.total;
        isAccountTypesDetsLoading.value = false;
    }

    async function addAccountTypesDet(payload) {
        isAccountTypesDetLoading.value = true;

        const { data, statusCode } = await useApi(`accountTypesDets`).post(payload);

        isAccountTypesDetLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function updateAccountTypesDet(id, payload) {
        isAccountTypesDetLoading.value = true;

        const { data, statusCode } = await useApi(`accountTypesDets/${id}`).put(
            payload
        );

        isAccountTypesDetLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function importAccountTypesDet(payload) {
        isLoadingImportAccountTypeDet.value = true
        const formData = new FormData()

        formData.append('file', payload.file)
        _map(payload.fields, el => {
            Object.keys(el).map(key => formData.append(key, el[key]))
        })

        const { data, statusCode } = await useApi(`accountTypesDets/import`, {
            method: "POST",
            headers: { "Content-Type": null },
            body: formData,
        }).blob()

        if (statusCode.value != 201) {
            download(data.value, `account-types-dets-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            rowsError.value = 1
        }

        getAccountTypesDets()

        isLoadingImportAccountTypeDet.value = false
        // let res = (statusCode === 201 && !data.length) ? true : false

        return statusCode.value === 201
    }

    async function deleteAccountTypesDet(id) {
        isAccountTypesDetLoading.value = true

        const { data, statusCode } = await useApi(`accountTypesDets/${id}`).delete()

        isAccountTypesDetLoading.value = false

        return { statusCode: statusCode.value, data: data.value }
    }

    function reset(stateVar = "all") {
        if (stateVar == "all" || stateVar?.includes("selectedAccountTypesDet"))
            selectedAccountTypesDet.value = {};
        if (stateVar == "all" || stateVar?.includes("accountTypesDets"))
            accountTypesDets.value = [];
        if (stateVar == "all" || stateVar?.includes("total")) total.value = 0;
        if (stateVar == "all" || stateVar?.includes("filters")) filters.value = {};
        if (stateVar == "all" || stateVar?.includes("isAccountTypesDetLoading"))
            isAccountTypesDetLoading.value = false;
        if (stateVar == "all" || stateVar?.includes("isAccountTypesDetsLoading"))
            isAccountTypesDetsLoading.value = false;
    }

    return {
        // states
        selectedAccountTypesDet,
        accountTypesDets,
        isAccountTypesDetsLoading,
        isAccountTypesDetLoading,
        total,
        filters,
        isEditMode,
        isDownloadingExport,
        rowsError,
        isLoadingImportAccountTypeDet,

        // actions
        getAccountTypesDet,
        getDTAccountTypesDets,
        getAccountTypesDets,
        addAccountTypesDet,
        updateAccountTypesDet,
        reset,
        exportAccountTypesDets,
        importAccountTypesDet,
        deleteAccountTypesDet,
        fetchAccountTypesDets,
    };
});
