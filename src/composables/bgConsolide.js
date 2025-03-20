import { storeToRefs } from "pinia";
import { useBgConsolideStore, useCoreStore, useExerciceStore, useCompanyStore, useChartAccountStore } from "@/stores"
export function useBgConsolide(t = e => e, showSnackbar) {
    const bgConsolidStore = useBgConsolideStore();
    const { isExportingBgConsolide, isLoadingBgConsolide, currentBgConsolide, bgConsolides, total, filter } = storeToRefs(bgConsolidStore);
    const exerciceStore = useExerciceStore()
    const { exercices } = storeToRefs(exerciceStore)
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const companyStore = useCompanyStore();
    const { companies: companiesData } = storeToRefs(companyStore);
    const chartAccountStore = useChartAccountStore();
    const { chartAccounts } = storeToRefs(chartAccountStore);
    const sendForm = ref(null)
    const selected = ref([])
    const isInsertbgConsolidesDialogShown = ref(false)
    const companies = ref([])
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
            title: t("Reference"),
            sortable: true,
            key: "reference",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        // {
        //     title: t('Company'),
        //     sortable: true,
        //     key: "company_label",
        //     filtervalue: "",
        //     filterable: true,
        //     typefilter: "select",
        //     selectvalue: companiesData,
        //     itemKey: "id",
        //     itemTitle: "label",
        // },
        {
            title: t("status"),
            sortable: true,
            key: "status",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            itemKey: "key",
            itemTitle: "title",
            selectvalue: getEnums(enums.value.balanceStatus, t),
        },
        // {
        //     title: t("year"),
        //     sortable: true,
        //     key: "year",
        //     filtervalue: "",
        //     filterable: true,
        //     typefilter: "range",
        // },
        {
            title: t("companies"),
            sortable: false,
            key: "bg_consolide_companies",
        },
        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ])
    const availableMonths = ref([
        { value: 1, label: t("January") },
        { value: 2, label: t("February") },
        { value: 3, label: t("March") },
        { value: 4, label: t("April") },
        { value: 5, label: t("May") },
        { value: 6, label: t("June") },
        { value: 7, label: t("July") },
        { value: 8, label: t("August") },
        { value: 9, label: t("September") },
        { value: 10, label: t("October") },
        { value: 11, label: t("November") },
        { value: 12, label: t("December") },
    ]);
    const currentYear = new Date().getFullYear();
    const yearRange = ref([
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
        currentYear + 2,
    ]);
    const router = useRouter();

    function changeFilter(...payload) {
        bgConsolidStore.getBgConsolides(...payload)
    }

    function openModal() {
        isInsertbgConsolidesDialogShown.value = true
        if (chartAccounts.value.length === 1) {
            currentBgConsolide.value.chartaccount_id = chartAccounts.value[0].id;
        }
    }

    function statusCpcAndBilanColor(status) {
        switch (status) {
            case enums.value.cpcStatus.VALIDEE:
                return 'bg-success';
            case enums.value.cpcStatus.BROUILLON:
                return 'bg-warning';
            case null:
            case '':
                return 'bg-error';
            default:
                return '';
        }
    }

    function getBalanceStatusColor(status) {
        switch (status) {
            case enums.value.balanceStatus.BROUILLON:
                return 'grey';
            case enums.value.balanceStatus.IMPORT_INITIAL_REUSSI:
                return 'primary';
            case enums.value.balanceStatus.PROVISIONS_TERMINEES:
                return 'info';
            case enums.value.balanceStatus.VALIDEE:
                return 'success';
            case enums.value.balanceStatus.CLOTURE:
                return 'error';
            default:
                return '';
        }
    };

    async function getData() {
        if (isEmpty(exercices.value)) await exerciceStore.getExercicesIdYear()
        if (isEmpty(bgConsolides.value)) await bgConsolidStore.getBgConsolides()
        await companyStore.getOnlyActiveCompanies()
        if (isEmpty(chartAccounts.value)) {
            await chartAccountStore.fetchChartAccounts();
        }
    }

    return {
        enums,
        router,
        headers,
        selected,
        sendForm,
        yearRange,
        companies,
        companiesData,
        chartAccounts,
        availableMonths,
        isInsertbgConsolidesDialogShown,
        isExportingBgConsolide,
        isLoadingBgConsolide, 
        currentBgConsolide, 
        bgConsolides,
        exercices,
        total, 
        filter,
        bgConsolidStore,
        statusCpcAndBilanColor,
        getBalanceStatusColor,
        changeFilter,
        openModal,
        getData
    }
}
