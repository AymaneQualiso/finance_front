import { isEmpty } from "@/@core/utils/helpers";
import { useCoreStore, useBilanStore, useExerciceStore } from "@/stores"
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

export function useBilan(t = e => e, showSnackbar) {
    const bilanStore = useBilanStore()
    const { filter, total, bilanItems, isLoadingBilanItems, currentBilan, bilanDetails, bilanPassifDetails, isCalculating, isExportingBilans, isBilanLoading, balanceHeads, users } = storeToRefs(bilanStore)
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const exerciceStore = useExerciceStore()
    const { exercices } = storeToRefs(exerciceStore)
    const router = useRouter();


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
    const bilanForm = ref({
        balanceId: "",
    })
    const mailForm = ref({
        to: [],
        cc: [],
    })
    const yearsReferenceData = ref([])
    const sendForm = ref(null)
    const isAddDialogOpen = ref(false)
    const isSendMailDialogOpen = ref(false)
    const isSendingMail = ref(false)
    const isConfirmChoiceDialogVisible = ref(false)

    function changeFilter(...obj) {
        bilanStore.getBilanItems(...obj)
    }

    async function getData() {
        if (isEmpty(enums.value)) await coreStore.getEnums()
        await bilanStore.getBilanItems()
    }

    async function getBilan(id) {
        await bilanStore.getBilan(id)
    }

    async function calculateBilan(id, allBilan) {
        let isSuccessful = await bilanStore.calculateBilan(id, allBilan)
        if (isSuccessful) {
            showSnackbar(t("bilan calculation successful"), {
                color: "success",
            });
        } else {
            showSnackbar(t("bilan calculation failed"), {
                color: "error",
            });
        }
    }

    async function handleBilanExport(id) {
        await bilanStore.exportList(id)
    }

    async function updateTotal4ForBilan(item) {
        return await bilanStore.updateTotal4ForBilanItem(item)
    }
    async function updateTotal2ForBilan(item) {
        return await bilanStore.updateTotal2ForBilanItem(item)
    }
    async function updateTotal1ForBilan(item) {
        return await bilanStore.updateTotal1ForBilanItem(item)
    }

    function openModal() {
        isAddDialogOpen.value = true
    }
    function openMailModal() {
        isSendMailDialogOpen.value = true
    }

    function closeModal() {
        isAddDialogOpen.value = false
        isSendMailDialogOpen.value = false
        yearsReferenceData.value = [];
        bilanForm.value.balanceId = ""
        bilanForm.value.scenario = ""
        bilanForm.value.year_reference = ""
    }

    async function createBilanItem() {
        sendForm.value.validate().then(async ({ valid }) => {
            if (!valid) return

            const { data, statusCode } = await bilanStore.addBilan(bilanForm.value)
            if (statusCode === 201) {
                yearsReferenceData.value = [];
                bilanForm.value.balanceId = ""
                bilanForm.value.scenario = ""
                bilanForm.value.year_reference = ""
                showSnackbar(t("Added ok", { model: t("bilan") }), {
                    color: "success",
                });
                // await getData()
                // isAddDialogOpen.value = false
                router.push({ name: "bilan-edit", params: { id: data.id } });
            } else if (statusCode === 422) {
                if (data.errors && Object.keys(data.errors).length > 0) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    const firstErrorMessage = data.errors[firstErrorKey][0];

                    showSnackbar(t(firstErrorMessage), { color: "error" });
                } else {
                    showSnackbar(t(data.message), { color: "error" });
                }
            } else {
                showSnackbar(t("try again in a few seconds"), { color: "error" });
            }

        })
    }

    async function getAllBalanceHeads() {
        if (isEmpty(balanceHeads.value)) await bilanStore.getActiveBalanceHeads()
    }

    async function handleMailSending(bilanId) {
        return await bilanStore.sendMail(bilanId, mailForm.value)
    }

    async function getEmailsUsers() {
        await bilanStore.getEmailsUsers()
    }

    async function checkScenario(value) {
        bilanForm.value.year_reference = ""
        yearsReferenceData.value = [];

        if (!bilanForm.value.balanceId) {
            showSnackbar(t("select balance first!"), {
                color: "warning",
            });
            bilanForm.value.scenario = null
            return;
        }

        switch (value) {
            case enums.value.scenarioBilan.DEFINITIVE:

                const balance = balanceHeads.value.find((bal) => bal.id == bilanForm.value.balanceId)
                // const { data, statusCode } = await exerciceStore.getExerciceN1(balance.exercice_id)
                if (!balance) {
                    showSnackbar(t("balance not found!"), { color: "warning" });
                    break;
                }
                console.log("Balance flag_bg_consolide value:", balance.flag_bg_consolide); 

                if (balance.flag_bg_consolide == true) {
                    populateYearsReference();
                    break;
                  }

                if (!balance.exercice_n_1 || isEmpty(balance.exercice_n_1)) {
                    showSnackbar(t("exercice n_1 empty in balance"), { color: "warning" });
                    break;
                }

                bilanForm.value.year_reference = balance.exercice_n_1
                break;

            case enums.value.scenarioBilan.SIMULATION:
                populateYearsReference();
                break;
            default:
                yearsReferenceData.value = [];
                break;
        }
    }

    function populateYearsReference() {
        const balance = balanceHeads.value.find((bal) => bal.id == bilanForm.value.balanceId)

        // const yearMatch = balance.label.match(/-\s*(\d{4})\s*-/);
        const yearMatch = balance.year;
        if (!yearMatch) {
            console.error("Year not found in label:", balance.label);
            return [];
        }

        // const extractedYear = parseInt(yearMatch[1], 10);
        const extractedYear = parseInt(yearMatch, 10);
        const maxYearsBack = 5;

        yearsReferenceData.value = Array.from({ length: maxYearsBack }, (_, index) => {
            const year = extractedYear - (index + 1);
            return { key: year, title: year.toString() };
        });
    }

    

    function handleDisplayDoubleChoiceCalcul() {
        isConfirmChoiceDialogVisible.value = true
    }

    function closeDisplayDoubleChoiceCalcul() {
        isConfirmChoiceDialogVisible.value = false
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
        getIsBgConsolideColor,
        enums,
        coreStore,
        headers,
        filter,
        total,
        bilanItems,
        currentBilan,
        bilanDetails,
        bilanPassifDetails,
        isCalculating,
        isLoadingBilanItems,
        bilanStore,
        sendForm,
        yearsReferenceData,
        isConfirmChoiceDialogVisible,
        handleDisplayDoubleChoiceCalcul,
        closeDisplayDoubleChoiceCalcul,
        checkScenario,
        changeFilter,
        getData,
        getBilan,
        calculateBilan,
        handleBilanExport,
        isExportingBilans,
        updateTotal4ForBilan,
        updateTotal2ForBilan,
        updateTotal1ForBilan,
        openModal,
        isAddDialogOpen,
        isBilanLoading,
        createBilanItem,
        balanceHeads,
        getAllBalanceHeads,
        bilanForm,
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
