import { map as _map } from "lodash";


export const useLockdownStore = defineStore("lockdown", () => {
    const selectedLockdown = ref({});
    const lockdowns = ref([]);
    const users = ref([]);
    const isLockdownsLoading = ref(false);
    const isLockdownLoading = ref(false);
    const rowsError = ref(null);
    const total = ref(0);
    const filters = ref({});
    const isEditMode = ref(false);
    const modulesData = ref([])

    async function getLockdown(id) {
        isLockdownLoading.value = true;

        const { data } = await useApi(`lockdowns/${id}`).get();

        selectedLockdown.value = data?.value?.data;
        isLockdownLoading.value = false;
    }

    async function fetchLockdowns(queryParams = {}) {
        let query = getQuery(queryParams);

        const { data, statusCode } = await useApi(`lockdowns${query}`).get();

        lockdowns.value = data.value?.data;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function fetchSelectData() {
        const { data } = await useApi(`lockdowns/select-data`).get()

        users.value = data.value?.users
    }

    async function getDTlockdowns(...payload) {
        isLockdownsLoading.value = true;
        if (payload) filters.value = Object.assign({}, filters.value, ...payload);

        const { data } = await fetchLockdowns(filters.value);

        lockdowns.value = data?.data;
        total.value = data?.meta?.total;
        isLockdownsLoading.value = false;
    }

    async function getLockdowns(params = {}) {
        isLockdownsLoading.value = true;

        params = { per_page: 100, ...params };

        const { data } = await fetchLockdowns(params);

        lockdowns.value = data?.data;
        total.value = data?.meta?.total;
        isLockdownsLoading.value = false;
    }

    async function addLockdown(payload) {
        isLockdownLoading.value = true;

        const { data, statusCode } = await useApi(`lockdowns`).post(payload);

        isLockdownLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function updateLockdown(id, payload) {
        isLockdownLoading.value = true;

        const { data, statusCode } = await useApi(`lockdowns/${id}`).put(
            payload
        );

        isLockdownLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function reOpenBalance(id) {
        isLockdownLoading.value = true;

        const { data, statusCode } = await useApi(`lockdowns/${id}/re-open-bg`).put();

        isLockdownLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function deleteLockdown(id) {
        isLockdownLoading.value = true

        const { data, statusCode } = await useApi(`lockdowns/${id}`).delete()

        isLockdownLoading.value = false

        return { statusCode: statusCode.value, data: data.value }
    }

    async function getModulesData() {
        isLockdownLoading.value = true

        const { data, statusCode } = await useApi(`lockdowns/getModulesData`).get()

        isLockdownLoading.value = false

        if (statusCode.value === 200) {
            console.log('modules', data.value);

            modulesData.value = data.value
        }
    }

    function reset(stateVar = "all") {
        if (stateVar == "all" || stateVar?.includes("selectedLockdown"))
            selectedLockdown.value = {};
        if (stateVar == "all" || stateVar?.includes("lockdowns"))
            lockdowns.value = [];
        if (stateVar == "all" || stateVar?.includes("total")) total.value = 0;
        if (stateVar == "all" || stateVar?.includes("filters")) filters.value = {};
        if (stateVar == "all" || stateVar?.includes("isLockdownLoading"))
            isLockdownLoading.value = false;
        if (stateVar == "all" || stateVar?.includes("isLockdownsLoading"))
            isLockdownsLoading.value = false;
    }

    return {
        // states
        selectedLockdown,
        lockdowns,
        isLockdownsLoading,
        isLockdownLoading,
        total,
        filters,
        isEditMode,
        users,
        modulesData,
        // actions
        getLockdown,
        getDTlockdowns,
        getLockdowns,
        addLockdown,
        updateLockdown,
        reset,
        deleteLockdown,
        fetchSelectData,
        getModulesData,
        reOpenBalance
    };
});
