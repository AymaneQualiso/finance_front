import { map } from "lodash";
import { defineStore } from "pinia";

export const useCpcStore = defineStore({
    id: "cpc",
    state: () => ({
        isLoadingCpcItems: false,
        isLoadingSendingEmail: false,
        cpcItems: [],
        currentCpc: {},
        cpcDetails: [],
        balanceHeads: [],
        isCalculating: false,
        isExportingCpcs: false,
        total: 0,
        filter: {},
        isCpcLoading: false,
        users: [],
    }),
    actions: {
        async getCpcItems(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingCpcItems = true

            const { data, statusCode } = await useApi(`cpcs${query}`)

            this.cpcItems = data.value.data
            this.total = data.value.meta.total
            this.isLoadingCpcItems = false
            return statusCode.value === 200
        },

        async getCpc(id) {
            this.isLoadingCpcItems = true

            const { data, statusCode } = await useApi(`cpcs/${id}`)

            if (statusCode.value === 200) {
                this.currentCpc = data.value?.cpcEntete
                this.cpcDetails = data.value?.cpcDetails
            }
            this.isLoadingCpcItems = false
        },
        async calculateCpc(id, allCpc = false) {
            this.isCalculating = true

            try {
                const { data, statusCode } = await useApi(`cpcs/${id}/calcul/${allCpc}`)
                if (statusCode.value === 200) {
                    this.cpcDetails = data.value.cpcDetails
                }
                console.log("aaaa")
                console.log(statusCode.value)
                return statusCode.value === 200
            } catch (error) {
                console.log("bbb")
                console.error(error)
            } finally {
                this.isCalculating = false
            }
        },
        async exportList(id) {
            this.isExportingCpcs = true

            const { data, statusCode } = await useApi(`cpcs/export/${id}`).blob();

            if (statusCode.value === 200) {
                download(data.value, `Cpc-${id}.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }

            this.isExportingCpcs = false
        },
        async updateTotal4ForCpcItem(item) {
            const { data, statusCode } = await useApi(`cpcs/update-total4/${item.id}`).post(item)

            return statusCode.value === 200
        },
        async addCpc(cpcForm) {
            try {
                console.log("Starting addCpc with form data:", cpcForm);

                this.isCpcLoading = true;

                // Make the API call
                const { data, statusCode } = await useApi("cpcs").post(cpcForm);
                console.log("API Response:", { data, statusCode });

                // Check if the response is successful
                if (statusCode.value === 201) {
                    // Update items on success
                    this.cpcItems = data.value.cpcEntetes;
                    console.log("Updated cpcItems:", this.cpcItems);

                    this.isCpcLoading = false;

                    // Log success message
                    console.log("CPC item created successfully!");

                    // Return success with a message
                    return {
                        success: true,
                        id: data.value.id,
                        message: "CPC item created successfully",
                    };
                } else {
                    // Handle error cases
                    this.isCpcLoading = false;

                    // Log backend error message and errors
                    console.error("Error from backend:", {
                        message: data.value?.message,
                        errors: data.value?.errors,
                    });

                    return {
                        success: false,
                        message: data.value?.message || "Failed to create CPC item.",
                        errors: data.value?.errors || null, // Optional field-specific errors
                    };
                }
            } catch (error) {
                console.error("Error in addCpc (unexpected):", error);

                this.isCpcLoading = false;

                // Handle unexpected errors
                return {
                    success: false,
                    message: "An unexpected error occurred. Please try again.",
                    errors: null,
                };
            }
        },

        async getActiveBalanceHeads() {
            const { data, statusCode } = await useApi('cpcs/getActiveBalanceHeads')

            if (statusCode.value === 200) {
                this.balanceHeads = data.value
            }
        },
        async sendMail(cpcId, mailForm) {
            this.isLoadingSendingEmail = true
            try {
                const { data, statusCode } = await useApi(`cpcs/${cpcId}/send-mail`).post(mailForm)
                this.isLoadingSendingEmail = false
                return statusCode.value === 200
            } catch (error) {
                console.error(error)
                this.isLoadingSendingEmail = false
                return false;
            }
        },
        async getEmailsUsers() {
            const { data, statusCode } = await useApi('cpcs/usersEmails')

            if (statusCode.value === 200) {
                this.users = data.value
            }
        },
        async valideCpc(cpcId) {
            try {
                const { data, statusCode } = await useApi("cpc-validate").post({ cpcId });
                if (statusCode.value === 200) {
                    this.currentCpc = data.value?.cpcEntete;
                    console.log("CPC validated successfully:", data.value);
                    return {
                        success: true,
                        message: "CPC validated successfully!",
                    };
                } else {
                    console.error("Failed to validate CPC:", data.value);
                    return {
                        success: false,
                        message: data.value?.message || "Failed to validate CPC.",
                    };
                }
            } catch (error) {
                console.error("Error validating CPC:", error);
                return {
                    success: false,
                    message: "An unexpected error occurred during validation.",
                };
            }
        },




    },
})
