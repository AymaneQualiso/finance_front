import { map } from "lodash";
import { defineStore } from "pinia";

export const useClassAccount3sStore = defineStore({
    id: "class_account3s",
    state: () => ({
        isLoadingClassAccount3s: false,
        classAccount3s: [],
        currentClassAccount3s: {},
        total: 0,
        filter: {},
    }),
    actions: {
        async getOnlyIdLabel() {
            this.isLoadingClassAccount3s = true

            const { data, statusCode } = await useApi(`class_account3s/getOnlyIdLabel`)

            this.classAccount3s = data.value
            this.isLoadingClassAccount3s = false

            return statusCode.value === 200
        }
    }
})
