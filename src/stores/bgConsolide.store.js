import { map } from "lodash";
import { defineStore } from "pinia";

export const useBgConsolideStore = defineStore({
    id: "bgConsolide",
    state: () => ({
        isExportingBgConsolide: false,
        isLoadingBgConsolide: false,
        currentBgConsolide: {},
        bgConsolides: [],
        filter: {},
        total: 0,
    }),
    actions: {
        async getBgConsolides(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingBgConsolide = true

            const { data, statusCode } = await useApi(`bg_consolides${query}`)

            this.bgConsolides = data.value.data
            this.total = data.value.total
            this.isLoadingBgConsolide = false

            return statusCode.value === 200
        },

        async getAllBgConsolides() {
            this.isLoadingBgConsolide = true

            const { data } = await useApi(`bg_consolides?per_page=100`)

            this.bgConsolides = data.value.data
            this.isLoadingBgConsolide = false
        },

        async getBgConsolide(id) {
            this.isLoadingBgConsolide = true

            const { data, statusCode } = await useApi(`bg_consolides/${id}`)

            if (statusCode.value === 200) {
                this.currentBgConsolide = data.value
            }
            this.isLoadingBgConsolide = false
        },

        async getAllCompaniesByExercice(exercice, month, chartAccount) {
            const { data, statusCode } = await useApi(`bg_consolides/getAllCompaniesByExercice/${exercice}/${month}/${chartAccount}`)
            return { data: data.value, statusCode: statusCode.value }
        },

        async createBgConsolide(payload) {
            this.isLoadingBgConsolide = true;

            const { statusCode, data } = await useApi('bg_consolides').post(payload)

            if (statusCode.value === 201) {
                this.getBgConsolides()
            } 

            this.isLoadingBgConsolide = false;
            
            return { statusCode: statusCode.value, data: data.value }
        },

        async updateBgConsolide(payload) {
            this.isLoadingBgConsolide = true;

            const formData = new FormData();
            formData.append('_method', 'PUT')

            map(payload, (el, key) => {
                formData.append(key, el === null ? "" : el);
            });

            const { data, statusCode } = await useApi(`bg_consolides/${payload.id}`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 200) {
                this.getBgConsolides()
            } 

            this.isLoadingBgConsolide = false;

            return { statusCode: statusCode.value, data: data.value }
        },
    }
})
