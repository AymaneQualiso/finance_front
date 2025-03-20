import { map } from "lodash";
import { defineStore } from "pinia";

export const useAnalyticalAxiesStore = defineStore({
    id: "analyticalAxies",
    state: () => ({
        codeExist: false,
        isLoadingAnalyticalAxies: false,
        isExportingAnalyticalAxies: false,
        isLoadingImportAnalyticalAxies: false,
        AnalyticalAxies: [],
        currentAnalyticalAxies: {},
        total: 0,
        filter: {},
        fieldsData: {
            'Libellé': 'label',
            'Status': 'is_active',
            'Code': 'code',
            'Type d\'axe': 'axis_type_id'
        },
        requiredFieldsData: ['label', 'is_active', 'code', 'axis_type_id'],
    }),
    actions: {
        async getAnalyticalAxies(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingAnalyticalAxies = true

            const { data, statusCode } = await useApi(`analytical_axies${query}`)

            this.AnalyticalAxies = data.value.data
            this.total = data.value.meta.total
            this.isLoadingAnalyticalAxies = false

            return statusCode.value === 200
        },

        async getAnalyticalAxie(id) {
            this.isLoadingAnalyticalAxies = true

            const { data, statusCode } = await useApi(`analytical_axies/${id}`)

            if (statusCode.value === 200) {
                this.currentAnalyticalAxies = data.value
            }
            this.isLoadingAnalyticalAxies = false
        },

        async getAllAnalyticalAxies() {
            this.isLoadingAnalyticalAxies = true;
            this.error = null; 

            try {
                const { data, statusCode } = await useApi("analytical-axies");

                if (statusCode.value === 200) {
                    this.AnalyticalAxies = data.value.data;
                } else {
                    this.error = `Failed to fetch analytical axies. Status code: ${statusCode.value}`;
                }
            } catch (error) {
                this.error = `An error occurred while fetching analytical axies: ${error.message}`;
            } finally {
                this.isLoadingAnalyticalAxies = false;
            }
        },

        async createAnalyticalAxie(payload) {
            this.isLoadingAnalyticalAxies = true;

            const formData = new FormData();
            map(payload, (el, key) => {
                formData.append(key, el)
            })

            const { statusCode, data } = await useApi("analytical_axies", {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 201) {
                this.getAnalyticalAxies()
            } 

            this.isLoadingAnalyticalAxies = false;
            
            return { statusCode: statusCode.value, data: data.value }
        },

        async updateAnalyticalAxie(payload) {
            this.isLoadingAnalyticalAxies = true;

            const formData = new FormData();
            formData.append('_method', 'PUT')

            map(payload, (el, key) => {
                formData.append(key, el === null ? "" : el);
            });

            const { data, statusCode } = await useApi(`analytical_axies/${payload.id}`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 200) {
                this.getAnalyticalAxies()
            } 

            this.isLoadingAnalyticalAxies = false;

            return { statusCode: statusCode.value, data: data.value }
        },

        async deleteAnalyticalAxie(payload) {
            this.isLoadingAnalyticalAxies = true;
            
            const { statusCode } = await useApi(`analytical_axies/${payload}`).delete();

            if (statusCode.value === 200) {
                this.getAnalyticalAxies()
            }

            this.isLoadingAnalyticalAxies = true;

            return statusCode.value === 200
        },
        async importAnalyticalAxies(payload) {
            this.isLoadingImportAnalyticalAxies = true
            const formData = new FormData()

            formData.append('file', payload.file)
            map(payload.fields, el => {
                Object.keys(el).map(key => formData.append(key, el[key]))
            })
      
            const { data, statusCode } = await useApi(`analytical_axies/import`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            }).blob()
      
            if (statusCode.value != 201) {
                download(data.value, `axes-analytiques-erreur.xlsx`, { type: 'application/vnd.ms-excel' }).click()
                this.rowsError = 1
            }
      
            this.getAnalyticalAxies()
      
            this.isLoadingImportAnalyticalAxies = false
            
            return statusCode.value === 201
        },
        async exportList(ids) {
            this.filter = { ...this.filter, ...ids };
        
            let query = getQuery(this.filter);

            this.isExportingAnalyticalAxies = true
        
            const { data, statusCode } = await useApi(`analytical_axies/export${query}`).blob();
        
            if(statusCode.value === 200) {
                download(data.value, `Axes analytiques.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }
        
            this.isExportingAnalyticalAxies = false
        },
        async checkCode(code, id) {
            const { data, statusCode } = await useApi(`analytical_axies/checkCode/${code}/${id}`).get()
            if (statusCode.value === 200) {
                this.codeExist = data.value.data
            }
            return statusCode.value === 200
        },
    },
})
