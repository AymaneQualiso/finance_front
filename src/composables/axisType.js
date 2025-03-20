import { useAxisTypeStore, useCoreStore } from "@/stores"
export function useAxisType(t = e => e, showSnackbar) {
    const axisTypeStore = useAxisTypeStore();
    const { isLoadingAxisType, isExportingAxisType, axisTypes, currentAxisType, total, filter, requiredFieldsData, fieldsData } = storeToRefs(axisTypeStore);
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const isDialogDeleteVisible = ref(false)
    const isLoadingDeleteAxisType = ref([])
    const rememberId = ref(null)
    const isInsertAxisTypeDialogShown = ref(null)
    const showAxisTypeInReadOnlyMode = ref(false)
    const isLoadingImportAxisType = ref(false)
    const isImportDialogVisible = ref(false)
    const sendForm = ref(null)
    const selected = ref([])
    const AccountTypeForm = ref({
        label: "",
        is_active: "active",
        is_required: "oui",
      });
    const isRequiredData = ref([
        { text: t('Yes'), value: enums.value.isRequired.OUI },
        { text: t('No'), value: enums.value.isRequired.NON },
    ])
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
            title: t("is_required"),
            sortable: true,
            key: "is_required",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            itemKey: "value",
            itemTitle: "text",
            selectvalue: isRequiredData.value,//getEnums(enums.value.isRequired, t)
        },
        // {
        //     title: t("companies"),
        //     key: "company_id",
        //     filtervalue: "",
        //     filterable: true,
        //     typefilter: "text",
        
        //   },
        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ]);

    function changeFilter(...obj) {
        axisTypeStore.getAxisTypes(...obj)
    }

    function openModalDelete(item) {
        isDialogDeleteVisible.value = true;
        rememberId.value = item.id
    }

    function closeModalDelete() {
        isDialogDeleteVisible.value = false;
        rememberId.value = null;
    }

    async function deleteAxisType() {
        isLoadingDeleteAxisType.value[rememberId.value] = true
        const response = await axisTypeStore.deleteAxisType(rememberId.value);
        if (response) {
            isLoadingDeleteAxisType.value[rememberId.value] = false
            closeModalDelete();
            showSnackbar(t("Deleted ok", { model: t("axis_types.axis_type") }), { color: "success" });
        } else {
            isLoadingDeleteAxisType.value[rememberId.value] = false
            showSnackbar(t("try again in a few seconds"), { color: "error" });
        }
        
    }

    function openModal(item={}, disable=false) {
        if (!Object.keys(item).length) {
            item.is_active = enums.value.isActive.ACTIVE;
        }

        isInsertAxisTypeDialogShown.value = true
        showAxisTypeInReadOnlyMode.value = disable
        currentAxisType.value = { ...item };
    }

    function resetRememberId() {
        rememberId.value = null;
    }

    async function importAxisTypes(payload) {
        isLoadingImportAxisType.value = true
        const res  = await axisTypeStore.importAxisTypes(payload)

        if (res) {
            isImportDialogVisible.value = false
            showSnackbar(t('axis_type_import_success'), { color: 'success' })
        } else {
            isImportDialogVisible.value = false
            showSnackbar(t('Imported failed'), { color: 'error' })
        }
        isLoadingImportAxisType.value = false
    }

    async function exportExcel() {
        await axisTypeStore.exportList({ ids: selected.value })
    }

    async function getData() {
        await axisTypeStore.getAxisTypes()
        if (isEmpty(enums.value)) await coreStore.getEnums()
    }

    return {
        isDialogDeleteVisible,
        isLoadingDeleteAxisType,
        rememberId,
        axisTypeStore,
        isLoadingAxisType,
        axisTypes,
        currentAxisType,
        total,
        filter,
        fieldsData,
        requiredFieldsData,
        headers,
        coreStore,
        enums,
        isInsertAxisTypeDialogShown,
        sendForm,
        selected,
        showAxisTypeInReadOnlyMode,
        isImportDialogVisible,
        isLoadingImportAxisType,
        isExportingAxisType,
        isRequiredData,
        AccountTypeForm,
        openModal,
        deleteAxisType,
        openModalDelete,
        changeFilter,
        resetRememberId,
        closeModalDelete,
        importAxisTypes,
        exportExcel,
        getData
    }
}
