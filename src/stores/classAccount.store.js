import { map } from "lodash";
import { defineStore } from "pinia";

export const useClassAccountsStore = defineStore({
    id: "class_accounts",
    state: () => ({
        isLoadingClassAccounts: false,
        classAccounts: [],
        currentClassAccounts: {},
        total: 0,
        filter: {},
    }),
    actions: {
        async getOnlyIdLabel() {
            this.isLoadingClassAccounts = true

            const { data, statusCode } = await useApi(`class_accounts/getOnlyIdLabel`)

            this.classAccounts = data.value
            this.isLoadingClassAccounts = false

            return statusCode.value === 200
        }
    }
})
