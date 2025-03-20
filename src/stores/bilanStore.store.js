import { map } from "lodash";
import { defineStore } from "pinia";

export const useBilanStore = defineStore({
    id: "bilan-store",
    state: () => ({
        isLoadingBilanItems: false,
        bilanItems: [],
        currentBilan: {},
        bilanDetails: [],
        bilanPassifDetails: [],
        balanceHeads: [],
        isCalculating: false,
        isExportingBilans: false,
        total: 0,
        filter: {},
        isBilanLoading: false,
        users: [],
    }),
    actions: {
        async getBilanItems(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingBilanItems = true

            const { data, statusCode } = await useApi(`bilans${query}`)

            this.bilanItems = data.value?.data
            this.total = data.value?.meta?.total
            this.isLoadingBilanItems = false

            return statusCode.value === 200
        },

        async getBilan(id) {
            this.isLoadingBilanItems = true

            const { data, statusCode } = await useApi(`bilans/${id}`)

            if (statusCode.value === 200) {
                this.currentBilan = data.value?.bilanEntete
                this.bilanDetails = data.value?.bilanDetails
                this.bilanPassifDetails = data.value?.bilanPassifDetails
            }
            this.isLoadingBilanItems = false
        },
        async calculateBilan(id, allBilan) {
            this.isCalculating = true

            try {
                const { data, statusCode } = await useApi(`bilans/${id}/calcul/${allBilan}`)
                if (statusCode.value === 200) {
                    this.bilanDetails = data.value?.bilanDetails
                    this.bilanPassifDetails = data.value?.bilanPassifDetails
                }
                return statusCode.value === 200
            } catch (error) {
                console.error(error)
            } finally {
                this.isCalculating = false
            }
        },
        async exportList(id) {
            this.isExportingBilans = true

            const { data, statusCode } = await useApi(`bilans/export/${id}`).blob();

            if (statusCode.value === 200) {
                download(data.value, `Bilan-${id}.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }

            this.isExportingBilans = false
        },
        async updateTotal4ForBilanItem(item) {
            const { data, statusCode } = await useApi(`bilans/update-total4/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async updateTotal2ForBilanItem(item) {
            const { data, statusCode } = await useApi(`bilans/update-total2/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async updateTotal1ForBilanItem(item) {
            const { data, statusCode } = await useApi(`bilans/update-total1/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async addBilan(bilanForm) {
            this.isBilanLoading = true

            const { data, statusCode } = await useApi('bilans').post(bilanForm)

            if (statusCode.value === 201) {
                this.bilanItems = data.value.bilanEntetes
            }

            this.isBilanLoading = false

            return { data: data.value, statusCode: statusCode.value }
        },
        async getActiveBalanceHeads() {
            const { data, statusCode } = await useApi('bilans/getActiveBalanceHeads')

            if (statusCode.value === 200) {
                this.balanceHeads = data.value
            }
        },
        async sendMail(bilanId, mailForm) {
            try {
                const { data, statusCode } = await useApi(`bilans/${bilanId}/send-mail`).post(mailForm)
                return statusCode.value === 200
            } catch (error) {
                console.error(error)
                return false;
            }
        },

        
        async getEmailsUsers() {
            const { data, statusCode } = await useApi('bilans/usersEmails')

            if (statusCode.value === 200) {
                this.users = data.value
            }
        },
        async valideBilan(bilanId) {
            try {
                const { data, statusCode } = await useApi("bilan-validate").post({ bilanId });
                if (statusCode.value === 200) {
                    this.currentBilan = data.value?.bilanEntetes;
                    console.log("Bilan validated successfully:", data.value);
                    return {
                        success: true,
                        message: "Bilan validated successfully!",
                    };
                } else {
                    console.error("Failed to validate Bilan:", data.value);
                    return {
                        success: false,
                        message: data.value?.message || "Failed to validate Bilan.",
                    };
                }
            } catch (error) {
                console.error("Error validating Bilan:", error);
                return {
                    success: false,
                    message: "An unexpected error occurred during validation.",
                };
            }
        },

    },
})
