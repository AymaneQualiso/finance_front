import { useAnalyticalAxiesStore, useCoreStore, useAxisTypeStore, useCompanyStore } from "@/stores"
import { storeToRefs } from "pinia";
export function useAnalyticalAxies(t = e => e, showSnackbar) {
    const analyticalAxiesStore = useAnalyticalAxiesStore()
    const companiesStore = useCompanyStore()
    const { filter, total, AnalyticalAxies, codeExist, isExportingAnalyticalAxies, isLoadingAnalyticalAxies, currentAnalyticalAxies, requiredFieldsData, fieldsData } = storeToRefs(analyticalAxiesStore)
    const axisTypeStore = useAxisTypeStore();
    const { isLoadingAxisType, axisTypes, currentAxisType } = storeToRefs(axisTypeStore);
    const { companies } = storeToRefs(companiesStore)
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const isImportDialogVisible = ref(false)
    const isLoadingImportAnalyticalAxie = ref(false)
    const isLoadingDeleteAnalyticalAxie = ref([])
    const isInsertAnalyticalAxiesDialogShown = ref(false)
    const showAnalyticalAxiesInReadOnlyMode = ref(false)
    const isDialogDeleteVisible = ref(false)
    const rememberId = ref(null)
    const sendForm = ref(null)
    const selected = ref([])
    const headers = ref([
        {
            title: t("label"),
            sortable: true,
            key: "label",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("is_active"),
            sortable: true,
            key: "is_active",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            itemKey: "key",
            itemTitle: "title",
            selectvalue: getEnums(enums.value.isActive, t),
        },
        {
            title: t("code"),
            sortable: true,
            key: "code",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t('axis_types.axis_type'),
            sortable: false,
            key: "axis_type_label",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: axisTypes,
            itemKey: "id",
            itemTitle: "label",
        },
        // {
        //     title: t('axis_types.company_axis_type_label'),
        //     sortable: false,
        //     key: "company_axis_type_label",
        //     filtervalue: "",
        //     filterable: true,
        //     typefilter: "select",
        //     selectvalue: companies,
        //     itemKey: "id",
        //     itemTitle: "label",
        // },

        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ])

    function changeFilter(...obj) {
        analyticalAxiesStore.getAnalyticalAxies(...obj)
    }

    function openModal(item = {}, disable = false) {
        if (!Object.keys(item).length) {
            item.is_active = enums.value.isActive.ACTIVE;
        }
        isInsertAnalyticalAxiesDialogShown.value = true
        showAnalyticalAxiesInReadOnlyMode.value = disable
        currentAnalyticalAxies.value = { ...item };
    }

    async function deleteAnalyticalAxie() {
        isLoadingDeleteAnalyticalAxie.value[rememberId.value] = true
        const response = await analyticalAxiesStore.deleteAnalyticalAxie(rememberId.value);
        if (response) {
            isLoadingDeleteAnalyticalAxie.value[rememberId.value] = false
            closeModalDelete();
            showSnackbar(t("Deleted ok", { model: t("analytical_axies.analytical_axie") }), { color: "success" });
        } else {
            isLoadingDeleteAnalyticalAxie.value[rememberId.value] = false
            showSnackbar(t("try again in a few seconds"), { color: "error" });
        }
    }

    function closeModalDelete() {
        isDialogDeleteVisible.value = false;
        rememberId.value = null;
    }

    function openModalDelete(item) {
        isDialogDeleteVisible.value = true;
        rememberId.value = item.id
    }

    async function importAnalyticalAxies(payload) {
        isLoadingImportAnalyticalAxie.value = true
        const res = await analyticalAxiesStore.importAnalyticalAxies(payload)

        if (res) {
            isImportDialogVisible.value = false
            showSnackbar(t('analytical_axe_import_success'), { color: 'success' })
        } else {
            isImportDialogVisible.value = false
            showSnackbar(t('Imported failed'), { color: 'error' })
        }
        isLoadingImportAnalyticalAxie.value = false
    }

    async function exportExcel() {
        await analyticalAxiesStore.exportList({ ids: selected.value })
    }

    async function getData() {
        if (isEmpty(enums.value)) await coreStore.getEnums()
        await axisTypeStore.getOnlyIdLabelAxisTypes()
        await analyticalAxiesStore.getAnalyticalAxies()
        await companiesStore.getOnlyActiveCompanies()

    }

    return {
        enums,
        coreStore,
        headers,
        filter,
        total,
        AnalyticalAxies,
        currentAnalyticalAxies,
        isLoadingAnalyticalAxies,
        rememberId,
        isInsertAnalyticalAxiesDialogShown,
        showAnalyticalAxiesInReadOnlyMode,
        isLoadingDeleteAnalyticalAxie,
        isLoadingImportAnalyticalAxie,
        isExportingAnalyticalAxies,
        isImportDialogVisible,
        isDialogDeleteVisible,
        analyticalAxiesStore,
        requiredFieldsData,
        fieldsData,
        axisTypes,
        codeExist,
        selected,
        sendForm,
        importAnalyticalAxies,
        deleteAnalyticalAxie,
        closeModalDelete,
        openModalDelete,
        changeFilter,
        exportExcel,
        openModal,
        getData,
        companies
    }
}
