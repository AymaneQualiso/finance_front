import { map } from "lodash";
import { defineStore } from "pinia";

export const useFluxStore = defineStore({
    id: "flux-store",
    state: () => ({
        isLoadingFluxItems: false,
        fluxItems: [],
        currentFlux: {},
        fluxDetails: [],
        fluxPassifDetails: [],
        balanceHeads: [],
        isCalculating: false,
        isExportingFluxs: false,
        total: 0,
        filter: {},
        isFluxLoading: false,
        users: [],
        isSendingMail: false,
    }),
    actions: {
        async getFluxItems(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingFluxItems = true

            const { data, statusCode } = await useApi(`fluxs${query}`)

            this.fluxItems = data.value?.data
            this.total = data.value?.meta?.total
            this.isLoadingFluxItems = false

            return statusCode.value === 200
        },

        async getFlux(id) {
            this.isLoadingFluxItems = true

            const { data, statusCode } = await useApi(`fluxs/${id}`)

            if (statusCode.value === 200) {
                this.currentFlux = data.value?.fluxEntete
                this.fluxDetails = data.value?.fluxDetails
                this.fluxPassifDetails = data.value?.fluxPassifDetails
            }
            this.isLoadingFluxItems = false
        },
        async calculateFlux(id) {
            this.isCalculating = true

            try {
                const { data, statusCode } = await useApi(`fluxs/${id}/calcul`)
                if (statusCode.value === 200) {
                    this.fluxDetails = data.value?.fluxDetails
                    this.fluxPassifDetails = data.value?.fluxPassifDetails
                }
                return statusCode.value === 200
            } catch (error) {
                console.error(error)
            } finally {
                this.isCalculating = false
            }
        },
        async exportList(id) {
            this.isExportingFluxs = true

            const { data, statusCode } = await useApi(`fluxs/export/${id}`).blob();

            if (statusCode.value === 200) {
                download(data.value, `Flux-${id}.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }

            this.isExportingFluxs = false
        },
        async updateTotal3ForFluxItem(item) {
            const { data, statusCode } = await useApi(`fluxs/update-total3/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async updateTotal2ForFluxItem(item) {
            const { data, statusCode } = await useApi(`fluxs/update-total2/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async updateTotal1ForFluxItem(item) {
            const { data, statusCode } = await useApi(`fluxs/update-total1/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async addFlux(fluxForm) {
            this.isFluxLoading = true

            const { data, statusCode } = await useApi('fluxs').post(fluxForm)

            if (statusCode.value === 201) {
                this.fluxItems = data.value.fluxEntetes
            }

            this.isFluxLoading = false

            return { data: data.value, statusCode: statusCode.value }
        },
        async getActiveBalanceHeads() {
            const { data, statusCode } = await useApi('fluxs/getActiveBalanceHeads')

            if (statusCode.value === 200) {
                this.balanceHeads = data.value
            }
        },
        async sendMail(fluxId, mailForm) {
            try {
                this.isSendingMail = true
                const { data, statusCode } = await useApi(`fluxs/${fluxId}/send-mail`).post(mailForm)
                return statusCode.value === 200
            } catch (error) {
                console.error(error)
                return false;
            } finally {
                this.isSendingMail = false
            }
        },


        async getEmailsUsers() {
            const { data, statusCode } = await useApi('fluxs/usersEmails')

            if (statusCode.value === 200) {
                this.users = data.value
            }
        },
        async valideFlux(fluxId) {
            try {
                const { data, statusCode } = await useApi("flux-validate").post({ fluxId });
                if (statusCode.value === 200) {
                    this.currentFlux = data.value?.fluxEntetes;
                    console.log("Flux validated successfully:", data.value);
                    return {
                        success: true,
                        message: "Flux validated successfully!",
                    };
                } else {
                    console.error("Failed to validate Flux:", data.value);
                    return {
                        success: false,
                        message: data.value?.message || "Failed to validate Flux.",
                    };
                }
            } catch (error) {
                console.error("Error validating Flux:", error);
                return {
                    success: false,
                    message: "An unexpected error occurred during validation.",
                };
            }
        },

    },
})
