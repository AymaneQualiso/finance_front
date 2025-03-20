import { isEmpty } from "@/@core/utils/helpers";
import { useAccountsStore, useCoreStore, useClassAccount3sStore, useChartAccountStore, useClassAccount2sStore, useClassAccountsStore, useAccountTypeDetStore, useAccountTypeStore } from "@/stores"
import { storeToRefs } from "pinia";
export function useAccounts(t = e => e, showSnackbar) {
    const accountsStore = useAccountsStore();
    const accountTypeDetStore = useAccountTypeDetStore();
    const accountTypeStore = useAccountTypeStore();
    const { filter, total, accounts, chartAccountsCompanies, isExportingAccounts, isLoadingChartAccountsCompany, isLoadingAccounts, isLoadingImportAccounts, currentAccount, requiredFieldsData, fieldsData } = storeToRefs(accountsStore)
    const classAccount3sStore = useClassAccount3sStore();
    const { classAccount3s } = storeToRefs(classAccount3sStore);
    const classAccount2sStore = useClassAccount2sStore();
    const { classAccount2s } = storeToRefs(classAccount2sStore);
    const classAccountsStore = useClassAccountsStore();
    const { classAccounts } = storeToRefs(classAccountsStore);
    const chartAccountStore = useChartAccountStore();
    const { chartAccounts } = storeToRefs(chartAccountStore)
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const { accountTypesDets } = storeToRefs(accountTypeDetStore);
    const { accountTypes } = storeToRefs(accountTypeStore)
    const isImportDialogVisible = ref(false)
    const isLoadingDeleteAccount = ref([])
    const isInsertAccountsDialogShown = ref(false)
    const showAccountsInReadOnlyMode = ref(false)
    const isDialogDeleteVisible = ref(false)
    const rememberId = ref(null)
    const sendForm = ref(null)
    const selected = ref([])
    const isLoadingGetData = ref(false)
    const headers = ref([
        {
            title: t("N° Compte"),
            sortable: true,
            key: "value",
            filterable: true,
            filtervalue: [],
            typefilter: "range",
            isDouble: false,
        },
        {
            title: t("label"),
            sortable: true,
            key: "label",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("accounts.label_2"),
            sortable: true,
            key: "label_2",
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
            title: t('accounts.class_account_label'),
            sortable: true,
            key: "class_account_label",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: classAccounts,
            itemKey: "id",
            itemTitle: "label",
        },
        {
            title: t('accounts.class_account2_label'),
            sortable: true,
            key: "class_account2_label",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: classAccount2s,
            itemKey: "id",
            itemTitle: "label",
        },
        {
            title: t('accounts.class_account3_label'),
            sortable: true,
            key: "class_account3_label",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: classAccount3s,
            itemKey: "id",
            itemTitle: "label",
        },
        {
            title: t('accounts.chart_accounts_companies_label'),
            sortable: true,
            key: "chart_accounts_companies_label",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: chartAccountsCompanies,
            itemKey: "id",
            itemTitle: "label",
        },
        {
            title: t('accounts.account_type_det_label'),
            sortable: true,
            key: "account_type_det_label",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: accountTypesDets,
            itemKey: "id",
            itemTitle: "label",
        },
        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ])

    function changeFilter(...obj) {
        accountsStore.getAccounts(...obj)
    }

    function openModal(item = {}, disable = false) {
        if (!Object.keys(item).length) {
            if (chartAccounts.value.length === 1) {
                item.id_chart_account = chartAccounts.value[0].id;
            }
            item.is_active = enums.value.isActive.ACTIVE;
        }
        isInsertAccountsDialogShown.value = true
        showAccountsInReadOnlyMode.value = disable
        currentAccount.value = { ...item };
    }

    async function deleteAccount() {
        isLoadingDeleteAccount.value[rememberId.value] = true
        const response = await accountsStore.deleteAccount(rememberId.value);
        if (response) {
            isLoadingDeleteAccount.value[rememberId.value] = false
            closeModalDelete();
            showSnackbar(t("Deleted ok", { model: t("accounts.account") }), { color: "success" });
        } else {
            isLoadingDeleteAccount.value[rememberId.value] = false
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

    async function importAccounts(payload) {
        isLoadingImportAccounts.value = true
        const res = await accountsStore.importAccounts(payload)

        if (res) {
            isImportDialogVisible.value = false
            showSnackbar(t('account_import_success'), { color: 'success' })
        } else {
            isImportDialogVisible.value = false
            showSnackbar(t('Imported failed'), { color: 'error' })
        }
        isLoadingImportAccounts.value = false
    }

    async function exportExcel() {
        await accountsStore.exportList({ ids: selected.value })
    }

    async function getData() {
        isLoadingGetData.value = true
        if (isEmpty(enums.value)) await coreStore.getEnums()
        if (isEmpty(accounts.value)) await accountsStore.getAccounts()
        if (isEmpty(chartAccounts.value)) await chartAccountStore.getDTchartAccounts()
        await classAccountsStore.getOnlyIdLabel()
        await classAccount2sStore.getOnlyIdLabel()
        await accountsStore.getOnlyIdLabelChartAccountsCompanies()
        await classAccount3sStore.getOnlyIdLabel()
        await accountTypeDetStore.fetchAccountTypesDets()
        await accountTypeStore.fetchAccountTypes()
    }

    return {
        enums,
        coreStore,
        headers,
        filter,
        total,
        selected,
        accounts,
        currentAccount,
        isLoadingAccounts,
        rememberId,
        isInsertAccountsDialogShown,
        showAccountsInReadOnlyMode,
        isLoadingDeleteAccount,
        isLoadingImportAccounts,
        isImportDialogVisible,
        isDialogDeleteVisible,
        accountsStore,
        chartAccounts,
        requiredFieldsData,
        isExportingAccounts,
        isLoadingChartAccountsCompany,
        chartAccountsCompanies,
        classAccount3sStore,
        classAccount3s,
        fieldsData,
        // axisTypes,
        sendForm,
        accountTypesDets,
        accountTypes,
        isLoadingGetData,
        importAccounts,
        deleteAccount,
        closeModalDelete,
        openModalDelete,
        changeFilter,
        exportExcel,
        openModal,
        getData
    }
}
