import { map } from "lodash";
import { defineStore } from "pinia";

export const useClassAccount2sStore = defineStore({
    id: "class_account2s",
    state: () => ({
        isLoadingClassAccount2s: false,
        classAccount2s: [],
        currentClassAccount2s: {},
        total: 0,
        filter: {},
    }),
    actions: {
        async getOnlyIdLabel() {
            this.isLoadingClassAccount2s = true

            const { data, statusCode } = await useApi(`class_account2s/getOnlyIdLabel`)

            this.classAccount2s = data.value
            this.isLoadingClassAccount2s = false

            return statusCode.value === 200
        }
    }
})
