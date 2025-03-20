import { map as _map } from "lodash";


export const useGroupsStore = defineStore("groups", () => {
    const selectedGroup = ref({});
    const traitementGroups = ref([]);
    const usersGroups = ref([]);
    const traitementGroupsInterCompany = ref([]);
    const usersGroupsInterCompany = ref([]);



    const groups = ref([]);
    const companies = ref([]);
    const modules = ref([]);
    const users = ref([]);
    const isGroupsLoading = ref(false);
    const isGroupLoading = ref(false);
    const isDownloadingExport = ref(false);
    const isLoadingImportGroup = ref(false);
    const rowsError = ref(null);
    const total = ref(0);
    const filters = ref({});
    const isEditMode = ref(false);
    const t = inject("t");

    async function getGroup(id) {
        isGroupLoading.value = true;

        const { data } = await useApi(`groups/${id}`).get();

        selectedGroup.value = data?.value?.data;
        isGroupLoading.value = false;
    }

    async function fetchGroups(queryParams = {}) {
        let query = getQuery(queryParams);

        const { data, statusCode } = await useApi(`groups${query}`).get();

        groups.value = data.value?.data;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function fetchSelectData() {
        const { data } = await useApi(`groups/select-data`).get()

        companies.value = data.value?.companies
        users.value = data.value?.users
        modules.value = data.value?.modules.filter((module) =>
            module.name = t(module.name)
        )
    }

    async function getDTgroups(...payload) {
        isGroupsLoading.value = true;
        if (payload) filters.value = Object.assign({}, filters.value, ...payload);

        const { data } = await fetchGroups(filters.value);

        groups.value = data?.data;
        total.value = data?.meta?.total;
        isGroupsLoading.value = false;
    }

    async function exportGroups(ids) {
        isDownloadingExport.value = true;

        filters.value = { ...filters.value, ...ids };

        // export data with filters
        let query = getQuery(filters.value);
        const { data, statusCode } = await useApi(
            `groups/export${query}`
        ).blob();

        if (statusCode.value === 200) {
            download(data.value, 'groups.xlsx',
                { type: 'application/vnd.ms-excel' }
            ).click();
        }

        isDownloadingExport.value = false;
    }

    async function getGroups(params = {}) {
        isGroupsLoading.value = true;

        params = { per_page: 100, ...params };

        const { data } = await fetchGroups(params);

        groups.value = data?.data;
        total.value = data?.meta?.total;
        isGroupsLoading.value = false;
    }

    async function addGroup(payload) {
        isGroupLoading.value = true;

        const { data, statusCode } = await useApi(`groups`).post(payload);

        isGroupLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function updateGroup(id, payload) {
        isGroupLoading.value = true;

        const { data, statusCode } = await useApi(`groups/${id}`).put(
            payload
        );

        isGroupLoading.value = false;

        return { statusCode: statusCode.value, data: data.value };
    }

    async function importGroups(payload) {
        isLoadingImportGroup.value = true
        const formData = new FormData()

        formData.append('file', payload.file)
        _map(payload.fields, el => {
            Object.keys(el).map(key => formData.append(key, el[key]))
        })

        const { data, statusCode } = await useApi(`groups/import`, {
            method: "POST",
            headers: { "Content-Type": null },
            body: formData,
        }).blob()

        if (statusCode.value != 201) {
            download(data.value, `groups-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            rowsError.value = 1
        }

        getGroups()

        isLoadingImportGroup.value = false
        // let res = (statusCode === 201 && !data.length) ? true : false

        return statusCode.value === 201
    }

    async function deleteGroup(id) {
        isGroupLoading.value = true

        const { data, statusCode } = await useApi(`groups/${id}`).delete()

        isGroupLoading.value = false

        return { statusCode: statusCode.value, data: data.value }
    }

    function reset(stateVar = "all") {
        if (stateVar == "all" || stateVar?.includes("selectedGroup"))
            selectedGroup.value = {};
        if (stateVar == "all" || stateVar?.includes("groups"))
            groups.value = [];
        if (stateVar == "all" || stateVar?.includes("total")) total.value = 0;
        if (stateVar == "all" || stateVar?.includes("filters")) filters.value = {};
        if (stateVar == "all" || stateVar?.includes("isGroupLoading"))
            isGroupLoading.value = false;
        if (stateVar == "all" || stateVar?.includes("isGroupsLoading"))
            isGroupsLoading.value = false;
    }

    async function groupeTraitement(balanceId = null) {

        isGroupsLoading.value = true;

        try {
            const { data, statusCode } = await useApi(`groupe-data/${balanceId}`).get();
            console.log("API response received", { data, statusCode });
            console.log(data.value.users);

            if (statusCode.value === 200) {
                traitementGroups.value = data.value;
                const allUsers = data.value.flatMap(group => group.users || []);
                usersGroups.value = allUsers;



            } else {
                traitementGroups.value = [];
                usersGroups.value = [];

            }
        } catch (error) {
            traitementGroups.value = [];
            usersGroups.value = [];

        } finally {
            isGroupsLoading.value = false;
        }

    }

    async function groupeTraitementInterCompany() {

        isGroupsLoading.value = true;

        try {
            const { data, statusCode } = await useApi(`groupe-data-interCompany`).get();
            console.log("API response received inter", { data, statusCode });
            console.log(data.value.users);

            if (statusCode.value === 200) {
                traitementGroupsInterCompany.value = data.value;
                const allUsers = data.value.flatMap(group => group.users || []);
                usersGroupsInterCompany.value = allUsers;



            } else {
                traitementGroupsInterCompany.value = [];
                usersGroupsInterCompany.value = [];

            }
        } catch (error) {
            traitementGroupsInterCompany.value = [];
            usersGroupsInterCompany.value = [];

        } finally {
            isGroupsLoading.value = false;
        }

    }

    return {
        // states
        selectedGroup,
        groups,
        isGroupsLoading,
        isGroupLoading,
        total,
        filters,
        isEditMode,
        isDownloadingExport,
        isLoadingImportGroup,
        companies,
        users,
        modules,
        traitementGroups,
        usersGroups,
        usersGroupsInterCompany,
        traitementGroupsInterCompany,

        // actions
        getGroup,
        getDTgroups,
        getGroups,
        addGroup,
        updateGroup,
        reset,
        exportGroups,
        importGroups,
        deleteGroup,
        fetchSelectData,
        groupeTraitement,
        groupeTraitementInterCompany,

    };
});
