import { isEmpty } from "@/@core/utils/helpers";
import { useCoreStore, useCpcStore } from "@/stores"
import { ref, computed, onMounted, inject } from "vue";

import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

export function useCpc(t = e => e, showSnackbar) {
    const cpcStore = useCpcStore()
    const { filter, total, cpcItems, isLoadingCpcItems, currentCpc, cpcDetails, isCalculating, isExportingCpcs, isCpcLoading, balanceHeads, users, isLoadingSendingEmail } = storeToRefs(cpcStore)
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const router = useRouter();
    const isBgConsolide = ref(false);
    const sendForm = ref(null)
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
            title: t("scenario"),
            sortable: true,
            key: "scenario",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            selectvalue: getEnums(enums.value.scenarioBilan, t),
            itemKey: "key",
            itemTitle: "title",
        },
        {
            title: t("year_reference"),
            sortable: true,
            key: "year_reference",
            filtervalue: "",
            filterable: true,
            typefilter: "range",
        },
        {
            title: t("balance_sheet_label"),
            sortable: true,
            key: "balance_sheet_label",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("bgConsolides.bgConsolide"),
            key: "flag_bg_consolide",
            sortable: true,
            filterable: true,
            typefilter: "select",
            selectvalue: getEnums(enums.value.isBgConsolideEnum, t),
            itemKey: "key",
            itemTitle: "title",
        },
        {
            title: t("accounting-plan"),
            sortable: true,
            key: "chart_account",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("Company"),
            sortable: true,
            key: "company",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("status"),
            sortable: true,
            key: "status",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            itemKey: "key",
            itemTitle: "title",
            selectvalue: getEnums(enums.value.cpcStatus, t),
        },
        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ])
    const cpcForm = ref({
        balanceId: "",
    })
    const mailForm = ref({
        users: [],
    })
    const yearsReferenceData = ref([])
    const isAddDialogOpen = ref(false)
    const isSendMailDialogOpen = ref(false)
    const isSendingMail = ref(false)
    const isConfirmChoiceDialogVisible = ref(false)

    function changeFilter(...obj) {
        cpcStore.getCpcItems(...obj)
    }

    async function getData() {
        if (isEmpty(enums.value)) await coreStore.getEnums()
        await cpcStore.getCpcItems()
    }

    async function getCpc(id) {
        await cpcStore.getCpc(id)
    }
    const resetForm = () => {
        cpcForm.value = {
            balanceId: null,
            scenario: null,
            yearReference: null,
        };
    };

    async function calculateCpc(id, allCpc) {
        let isSuccessful = await cpcStore.calculateCpc(id, allCpc)
        console.log("isSuccessful")
        console.log(isSuccessful)
        if (isSuccessful) {
            showSnackbar(t("cpc calculation successful"), { color: 'success' });
        } else {
            showSnackbar(t("cpc calculation failed"), { color: 'error' });
        }
    }

    function handleDisplayDoubleChoiceCalcul() {
        isConfirmChoiceDialogVisible.value = true
    }

    function closeDisplayDoubleChoiceCalcul() {
        isConfirmChoiceDialogVisible.value = false
    }

    async function handleCpcExport(id) {
        await cpcStore.exportList(id)
    }

    async function updateTotal4ForCpc(item) {
        return await cpcStore.updateTotal4ForCpcItem(item)
    }

    function openModal() {
        resetForm();
        isAddDialogOpen.value = true
    }
    function openMailModal() {
        isSendMailDialogOpen.value = true
    }

    function closeModal() {
        isAddDialogOpen.value = false
        isSendMailDialogOpen.value = false
    }

    async function createCpcItem() {
        sendForm.value.validate().then(async ({ valid }) => {
            if (!valid) return

        const response = await cpcStore.addCpc(cpcForm.value);
        console.log("response", response);
        if (response.success) {
            await getData();
            isAddDialogOpen.value = false;
            showSnackbar((t("CPC item created successfully")), { color: 'success' });
            router.push({ name: 'cpc-edit', params: { id: response.id } });

        } else {
            showSnackbar((t(response.message) || "CPC item created fail!"), { color: 'error' });


            if (response.errors) {
                showSnackbar((response.message || "CPC item created fail!"), { color: 'error' });
            }
        }
        })
    }


    async function getAllBalanceHeads() {
        if (isEmpty(balanceHeads.value)) await cpcStore.getActiveBalanceHeads()
    }

    // async function handleMailSending(cpcId) {
    //     return await cpcStore.sendMail(cpcId, mailForm.value)
    // }
    async function handleMailSending(cpcId, emails) {
        return await cpcStore.sendMail(cpcId, emails.value)
    }

    async function getEmailsUsers() {
        await cpcStore.getEmailsUsers()
    }

    function getIsBgConsolideColor(status) {
        switch (status) {
            case 1:
                return 'success';
            case 0:
                return 'error';
            default:
                return '';
        }
    }

    return {
        isBgConsolide,
        getIsBgConsolideColor,
        sendForm,
        enums,
        coreStore,
        headers,
        filter,
        total,
        cpcItems,
        currentCpc,
        cpcDetails,
        isCalculating,
        isLoadingCpcItems,
        cpcStore,
        isLoadingSendingEmail,
        isConfirmChoiceDialogVisible,
        handleDisplayDoubleChoiceCalcul,
        closeDisplayDoubleChoiceCalcul,
        yearsReferenceData,
        changeFilter,
        getData,
        getCpc,
        calculateCpc,
        handleCpcExport,
        isExportingCpcs,
        updateTotal4ForCpc,
        openModal,
        isAddDialogOpen,
        isCpcLoading,
        createCpcItem,
        balanceHeads,
        getAllBalanceHeads,
        cpcForm,
        closeModal,
        handleMailSending,
        openMailModal,
        isSendMailDialogOpen,
        mailForm,
        isSendingMail,
        getEmailsUsers,
        users
    }
}
