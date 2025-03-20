import { map as _map } from "lodash";


export const useImportModelsStore = defineStore("import-models", () => {
    const selectedImportModel = ref({});
    const importModels = ref([]);
    const isImportModelsLoading = ref(false);
    const isImportModelLoading = ref(false);
    const rowsError = ref(null);
    const total = ref(0);
    const filters = ref({});
    const isEditMode = ref(false);

    async function getImportModel(id) {
        isImportModelLoading.value = true;

        const { data } = await useApi(`importModels/${id}`).get();

        selectedImportModel.value = data?.value?.data;
        isImportModelLoading.value = false;
    }

    async function fetchImportModels(queryParams = {}) {
        let query = getQuery(queryParams);

        const { data, statusCode } = await useApi(`importModels${query}`).get();

        importModels.value = data.value?.data;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function getDTimportModels(...payload) {
        isImportModelsLoading.value = true;
        if (payload) filters.value = Object.assign({}, filters.value, ...payload);

        const { data } = await fetchImportModels(filters.value);

        importModels.value = data?.data;
        total.value = data?.meta?.total;
        isImportModelsLoading.value = false;
    }

    async function getImportModels(params = {}) {
        isImportModelsLoading.value = true;

        params = { per_page: 100, ...params };

        const { data } = await fetchImportModels(params);

        importModels.value = data?.data;
        total.value = data?.meta?.total;
        isImportModelsLoading.value = false;
    }

    async function addImportModel(payload) {
        isImportModelLoading.value = true;

        const formData = new FormData();

        formData.append("file", payload.file[0]);
        formData.append("module", payload.module);
        formData.append("company", payload.company);
        formData.append("import_type_balance", payload.import_type_balance);


        const { data, statusCode } = await useApi(`importModels`, {
            method: "POST",
            headers: { "Content-Type": null },
            body: formData,
        });

        isImportModelLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function updateImportModel(id, payload, shouldFileBeChanged = false) {
        isImportModelLoading.value = true;

        const formData = new FormData();
        formData.append('_method', 'PUT')
        if (shouldFileBeChanged)
            formData.append("file", payload.file[0]);
        formData.append("module", payload.module);
        formData.append("company", payload.company);
        formData.append("import_type_balance", payload.import_type_balance);

        const { data, statusCode } = await useApi(`importModels/${id}`, {
            method: "POST",
            headers: { "Content-Type": null },
            body: formData,
        });

        isImportModelLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function importAccountTypes(payload) {
        isLoadingImportAccountType.value = true
        const formData = new FormData()

        formData.append('file', payload.file)
        _map(payload.fields, el => {
            Object.keys(el).map(key => formData.append(key, el[key]))
        })

        const { data, statusCode } = await useApi(`importModels/import`, {
            method: "POST",
            headers: { "Content-Type": null },
            body: formData,
        }).blob()

        if (statusCode.value != 201) {
            download(data.value, `account-types-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            rowsError.value = 1
        }

        getImportModels()

        isLoadingImportAccountType.value = false
        // let res = (statusCode === 201 && !data.length) ? true : false

        return statusCode.value === 201
    }

    async function deleteAccountType(id) {
        isImportModelLoading.value = true

        const { data, statusCode } = await useApi(`importModels/${id}`).delete()

        isImportModelLoading.value = false

        return { statusCode: statusCode.value, data: data.value }
    }

    function reset(stateVar = "all") {
        if (stateVar == "all" || stateVar?.includes("selectedImportModel"))
            selectedImportModel.value = {};
        if (stateVar == "all" || stateVar?.includes("importModels"))
            importModels.value = [];
        if (stateVar == "all" || stateVar?.includes("total")) total.value = 0;
        if (stateVar == "all" || stateVar?.includes("filters")) filters.value = {};
        if (stateVar == "all" || stateVar?.includes("isImportModelLoading"))
            isImportModelLoading.value = false;
        if (stateVar == "all" || stateVar?.includes("isImportModelsLoading"))
            isImportModelsLoading.value = false;
    }

    return {
        // states
        selectedImportModel,
        importModels,
        isImportModelsLoading,
        isImportModelLoading,
        total,
        filters,
        isEditMode,

        // actions
        getImportModel,
        getDTimportModels,
        getImportModels,
        addImportModel,
        updateImportModel,
        reset,
        deleteAccountType
    };
});
