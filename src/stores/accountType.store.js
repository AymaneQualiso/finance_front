import { map as _map } from "lodash";


export const useAccountTypeStore = defineStore("account-types", () => {
    const selectedAccountType = ref({});
    const accountTypes = ref([]);
    const isAccountTypesLoading = ref(false);
    const isAccountTypeLoading = ref(false);
    const isDownloadingExport = ref(false);
    const isLoadingImportAccountType = ref(false);
    const rowsError = ref(null);
    const total = ref(0);
    const filters = ref({});
    const isEditMode = ref(false);

    async function getAccountType(id) {
        isAccountTypeLoading.value = true;

        const { data } = await useApi(`accountTypes/${id}`).get();

        selectedAccountType.value = data?.value?.data;
        isAccountTypeLoading.value = false;
    }

    async function fetchAccountTypes(queryParams = {}) {
        let query = getQuery(queryParams);

        const { data, statusCode } = await useApi(`accountTypes${query}`).get();

        accountTypes.value = data.value?.data;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function getDTaccountTypes(...payload) {
        isAccountTypesLoading.value = true;
        if (payload) filters.value = Object.assign({}, filters.value, ...payload);

        const { data } = await fetchAccountTypes(filters.value);

        accountTypes.value = data?.data;
        total.value = data?.meta?.total;
        isAccountTypesLoading.value = false;
    }

    async function exportAccountTypes(ids) {
        isDownloadingExport.value = true;

        filters.value = { ...filters.value, ...ids };

        // export data with filters
        let query = getQuery(filters.value);
        const { data, statusCode } = await useApi(
            `accountTypes/export${query}`
        ).blob();

        if (statusCode.value === 200) {
            download(data.value, 'account_type.xlsx',
                { type: 'application/vnd.ms-excel' }
            ).click();
        }

        isDownloadingExport.value = false;
    }

    async function getAccountTypes(params = {}) {
        isAccountTypesLoading.value = true;

        params = { per_page: 100, ...params };

        const { data } = await fetchAccountTypes(params);

        accountTypes.value = data?.data;
        total.value = data?.meta?.total;
        isAccountTypesLoading.value = false;
    }

    async function addAccountType(payload) {
        isAccountTypeLoading.value = true;

        const { data, statusCode } = await useApi(`accountTypes`).post(payload);

        isAccountTypeLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function updateAccountType(id, payload) {
        isAccountTypeLoading.value = true;

        const { data, statusCode } = await useApi(`accountTypes/${id}`).put(
            payload
        );

        isAccountTypeLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function importAccountTypes(payload) {
        isLoadingImportAccountType.value = true
        const formData = new FormData()

        formData.append('file', payload.file)
        _map(payload.fields, el => {
            Object.keys(el).map(key => formData.append(key, el[key]))
        })

        const { data, statusCode } = await useApi(`accountTypes/import`, {
            method: "POST",
            headers: { "Content-Type": null },
            body: formData,
        }).blob()

        if (statusCode.value != 201) {
            download(data.value, `account-types-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            rowsError.value = 1
        }

        getAccountTypes()

        isLoadingImportAccountType.value = false
        // let res = (statusCode === 201 && !data.length) ? true : false

        return statusCode.value === 201
    }

    async function deleteAccountType(id) {
        isAccountTypeLoading.value = true

        const { data, statusCode } = await useApi(`accountTypes/${id}`).delete()

        isAccountTypeLoading.value = false

        return { statusCode: statusCode.value, data: data.value }
    }

    function reset(stateVar = "all") {
        if (stateVar == "all" || stateVar?.includes("selectedAccountType"))
            selectedAccountType.value = {};
        if (stateVar == "all" || stateVar?.includes("accountTypes"))
            accountTypes.value = [];
        if (stateVar == "all" || stateVar?.includes("total")) total.value = 0;
        if (stateVar == "all" || stateVar?.includes("filters")) filters.value = {};
        if (stateVar == "all" || stateVar?.includes("isAccountTypeLoading"))
            isAccountTypeLoading.value = false;
        if (stateVar == "all" || stateVar?.includes("isAccountTypesLoading"))
            isAccountTypesLoading.value = false;
    }

    return {
        // states
        selectedAccountType,
        accountTypes,
        isAccountTypesLoading,
        isAccountTypeLoading,
        total,
        filters,
        isEditMode,
        isDownloadingExport,
        isLoadingImportAccountType,

        // actions
        getAccountType,
        getDTaccountTypes,
        getAccountTypes,
        addAccountType,
        updateAccountType,
        reset,
        exportAccountTypes,
        importAccountTypes,
        deleteAccountType,
        fetchAccountTypes
    };
});
