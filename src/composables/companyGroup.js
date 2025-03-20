import { isEmpty } from "@/@core/utils/helpers";
import { useCompanyGroupStore, useCoreStore } from "@/stores"
export function useCompanyGroup(t = e => e, showSnackbar) {
    const companyGroupStore = useCompanyGroupStore();
    const { isCompanyGroupLoading, isExportingCompanyGroup, isLoadingImportCompanyGroups, companyGroups, currentCompanyGroup, total, filter, requiredFieldsData, fieldsData } = storeToRefs(companyGroupStore);
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const isDialogDeleteVisible = ref(false)
    const isLoadingDeleteCompanyGroup = ref([])
    const rememberId = ref(null)
    const isInsertCompanyGroupDialogShown = ref(null)
    const showCompanyGroupInReadOnlyMode = ref(false)
    const isImportDialogVisible = ref(false)
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
            title: t("companies"),
            key: "company",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        
          },
        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ]);

    function changeFilter(...obj) {
        companyGroupStore.getCompanyGroups(...obj)
    }

    function openModal(item={}, disable=false) {
        if (!Object.keys(item).length) {
            item.is_active = enums.value.isActive.ACTIVE;
         }
        //  else {
        //     console.log('item', item);
            
        //     const companiesIds = item.company.map(cmp => cmp.id);
        //     item = { ...item, companiesIds: companiesIds }
        // } // se
        isInsertCompanyGroupDialogShown.value = true
        showCompanyGroupInReadOnlyMode.value = disable
        currentCompanyGroup.value = { ...item };
        console.log("currentCompanyGroup", currentCompanyGroup.value);
        
    }

    function openModalDelete(item) {
        isDialogDeleteVisible.value = true;
        rememberId.value = item.id
    }

    function closeModalDelete() {
        isDialogDeleteVisible.value = false;
        rememberId.value = null;
    }

    function resetRememberId() {
        rememberId.value = null;
    }

    async function deleteCompanyGroup() {
        isLoadingDeleteCompanyGroup.value[rememberId.value] = true
        const { statusCode, data } = await companyGroupStore.deleteCompanyGroup(rememberId.value);
        if (statusCode === 200) {
            isLoadingDeleteCompanyGroup.value[rememberId.value] = false
            closeModalDelete();
            showSnackbar(t("Deleted ok", { model: t("company_groups.company_group") }), { color: "success" });
        } else if (statusCode === 409) {
            isLoadingDeleteCompanyGroup.value[rememberId.value] = false
            closeModalDelete();
            showSnackbar(t(data.message), { color: "warning" });
        } else {
            isLoadingDeleteCompanyGroup.value[rememberId.value] = false
            showSnackbar(t("try again in a few seconds"), { color: "error" });
        }
    }

    async function exportExcel() {
        await companyGroupStore.exportList({ ids: selected.value })
    }

    async function importCompanyGroups(payload) {
        isLoadingImportCompanyGroups.value = true
        const res  = await companyGroupStore.importCompanyGroups(payload)

        if (res) {
            isImportDialogVisible.value = false
            showSnackbar(t('company_groups_import_success'), { color: 'success' })
        } else {
            isImportDialogVisible.value = false
            showSnackbar(t('Imported failed'), { color: 'error' })
        }
        isLoadingImportCompanyGroups.value = false
    }

    async function getData() {
        if (isEmpty(enums.value)) await coreStore.getEnums()
        if (isEmpty(companyGroups.value)) await companyGroupStore.getCompanyGroups()
    }

    return {
        isDialogDeleteVisible,
        isLoadingDeleteCompanyGroup,
        rememberId,
        companyGroupStore,
        isCompanyGroupLoading,
        companyGroups,
        currentCompanyGroup,
        total,
        filter,
        sendForm,
        requiredFieldsData,
        fieldsData,
        headers,
        selected,
        enums,
        isInsertCompanyGroupDialogShown,
        showCompanyGroupInReadOnlyMode,
        isImportDialogVisible,
        isLoadingImportCompanyGroups,
        isLoadingImportCompanyGroups,
        isExportingCompanyGroup,
        openModal,
        deleteCompanyGroup,
        openModalDelete,
        changeFilter,
        resetRememberId,
        closeModalDelete,
        importCompanyGroups,
        exportExcel,
        getData
    }
}
