import { isEmpty } from "@/@core/utils/helpers";
import { useCoreStore, useFluxStore, useExerciceStore } from "@/stores"
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

export function useFlux(t = e => e, showSnackbar) {
    const fluxStore = useFluxStore()
    const { filter, total, fluxItems, isLoadingFluxItems, currentFlux, fluxDetails, fluxPassifDetails, isCalculating, isExportingFluxs, isFluxLoading, balanceHeads, users, isSendingMail } = storeToRefs(fluxStore)
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
        // {
        //     title: t("scenario"),
        //     sortable: true,
        //     key: "scenario",
        //     filtervalue: "",
        //     filterable: true,
        //     typefilter: "select",
        //     selectvalue: getEnums(enums.value.scenarioBilan, t),
        //     itemKey: "key",
        //     itemTitle: "title",
        // },
        // {
        //     title: t("year_reference"),
        //     sortable: true,
        //     key: "year_reference",
        //     filtervalue: "",
        //     filterable: true,
        //     typefilter: "range",
        // },
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
    const fluxForm = ref({
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
    // const isSendingMail = ref(false)

    function changeFilter(...obj) {
        fluxStore.getFluxItems(...obj)
    }

    async function getData() {
        if (isEmpty(enums.value)) await coreStore.getEnums()
        await fluxStore.getFluxItems()
    }

    async function getFlux(id) {
        await fluxStore.getFlux(id)
    }

    async function calculateFlux(id) {
        let isSuccessful = await fluxStore.calculateFlux(id)
        if (isSuccessful) {
            showSnackbar(t("flux calculation successful"), {
                color: "success",
            });
        } else {
            showSnackbar(t("flux calculation failed"), {
                color: "error",
            });
        }
    }

    async function handleFluxExport(id) {
        await fluxStore.exportList(id)
    }

    async function updateTotal3ForFlux(item) {
        return await fluxStore.updateTotal3ForFluxItem(item)
    }
    async function updateTotal2ForFlux(item) {
        return await fluxStore.updateTotal2ForFluxItem(item)
    }
    async function updateTotal1ForFlux(item) {
        return await fluxStore.updateTotal1ForFluxItem(item)
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
        fluxForm.value.balanceId = ""
        fluxForm.value.scenario = ""
        fluxForm.value.year_reference = ""
    }

    async function createFluxItem() {
        sendForm.value.validate().then(async ({ valid }) => {
            if (!valid) return

            const { data, statusCode } = await fluxStore.addFlux(fluxForm.value)
            if (statusCode === 201) {
                yearsReferenceData.value = [];
                fluxForm.value.balanceId = ""
                fluxForm.value.scenario = ""
                fluxForm.value.year_reference = ""
                showSnackbar(t("Added ok", { model: t("flux") }), {
                    color: "success",
                });
                // await getData()
                // isAddDialogOpen.value = false
                getAllBalanceHeads();
                router.push({ name: "flux-edit", params: { id: data.id } });
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
        await fluxStore.getActiveBalanceHeads()
    }

    async function handleMailSending(fluxId) {
        return await fluxStore.sendMail(fluxId, mailForm.value)
    }

    async function getEmailsUsers() {
        await fluxStore.getEmailsUsers()
    }

    async function checkScenario(value) {
        fluxForm.value.year_reference = ""
        yearsReferenceData.value = [];

        if (!fluxForm.value.balanceId) {
            showSnackbar(t("select balance first!"), {
                color: "warning",
            });
            fluxForm.value.scenario = null
            return;
        }

        switch (value) {
            case enums.value.scenarioBilan.DEFINITIVE:

                const balance = balanceHeads.value.find((bal) => bal.id == fluxForm.value.balanceId)
                // const { data, statusCode } = await exerciceStore.getExerciceN1(balance.exercice_id)
                if (!balance) {
                    showSnackbar(t("balance not found!"), { color: "warning" });
                    break;
                }

                if (!balance.exercice_n_1 || isEmpty(balance.exercice_n_1)) {
                    showSnackbar(t("exercice n_1 empty in balance"), { color: "warning" });
                    break;
                }

                fluxForm.value.year_reference = balance.exercice_n_1
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
        const balance = balanceHeads.value.find((bal) => bal.id == fluxForm.value.balanceId)

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
        fluxItems,
        currentFlux,
        fluxDetails,
        fluxPassifDetails,
        isCalculating,
        isLoadingFluxItems,
        fluxStore,
        sendForm,
        yearsReferenceData,
        checkScenario,
        changeFilter,
        getData,
        getFlux,
        calculateFlux,
        handleFluxExport,
        isExportingFluxs,
        updateTotal3ForFlux,
        updateTotal2ForFlux,
        updateTotal1ForFlux,
        openModal,
        isAddDialogOpen,
        isFluxLoading,
        createFluxItem,
        balanceHeads,
        getAllBalanceHeads,
        fluxForm,
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
