import { getQuery } from "@/@core/utils/helpers"
import { defineStore } from "pinia"
import { map } from "lodash";

export const useCompanyGroupStore = defineStore({
    id: "company_groups",
    state: () => ({
        isCompanyGroupLoading: false,
        isExportingCompanyGroup: false,
        isLoadingImportCompanyGroups: false,
        companyGroups: [],
        total: 0,
        filter: {},
        currentCompanyGroup: {},
        fieldsData: {
            'Libellé': 'label',
            'Status': 'is_active',
        },
        requiredFieldsData: ['label'],
    }),
    actions: {
        async getAllCompanyGroups(...payload) {
            this.isCompanyGroupLoading = true

            const queryString = getQuery({ "per_page": 100 }, ...payload)

            const { data } = await useApi(`company_groups${queryString}`)

            if (data.value && data.value.data) {
                this.companyGroups = data.value.data
                this.total = data.value.meta.total
            }

            this.isCompanyGroupLoading = false
        },

        async getCompanyGroups(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isCompanyGroupLoading = true

            const { data } = await useApi(`company_groups${query}`)

            if (data.value && data.value.data) {
                this.companyGroups = data.value.data
                this.total = data.value.meta.total
            }

            this.isCompanyGroupLoading = false
        },

        async getCompanyGroup(id) {
            this.isCompanyGroupLoading = true

            const { data } = await useApi(`company_groups/${id}`)

            if (data.value && data.value.data) {
                this.currentCompanyGroup = data.value.data
            }

            this.isCompanyGroupLoading = false
        },

        async addCompanyGroup(payload) {
            this.isCompanyGroupLoading = true

            const formData = new FormData();
            map(payload, (el, key) => {
                formData.append(key, el)
            })

            const { data, statusCode } = await useApi("company_groups", {
                method: "POST",
                body: JSON.stringify(payload), 
            })

            if (statusCode.value == 201) {
                this.getCompanyGroups()
            }

            this.isCompanyGroupLoading = false

            return { statusCode: statusCode.value, data: data.value }
        },

        async updateCompanyGroup(payload) {
            this.isCompanyGroupLoading = true

            const formData = new FormData();
            formData.append('_method', 'PUT')

            map(payload, (el, key) => {
                formData.append(key, el === null ? "" : el);
            });

            const { data, statusCode } = await useApi(`company_groups/${payload.id}`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value == 200) {
                this.getCompanyGroups()
            }

            this.isCompanyGroupLoading = false

            return { statusCode: statusCode.value, data: data.value }
        },

        async deleteCompanyGroup(payload) {
            this.isCompanyGroupLoading = true

            const { data, statusCode } = await useApi(`company_groups/${payload}`, {
                method: "DELETE",
            })

            if (statusCode.value === 200) {
                this.getCompanyGroups()
            }

            this.isCompanyGroupLoading = false

            return { statusCode: statusCode.value, data: data.value }
        },

        async exportList(ids) {
            this.filter = { ...this.filter, ...ids };
        
            let query = getQuery(this.filter);

            this.isExportingCompanyGroup = true
        
            const { data, statusCode } = await useApi(`company_groups/export${query}`).blob();
        
            if(statusCode.value === 200) {
              download(data.value, `Groupes de sociétés.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }
        
            this.isExportingCompanyGroup = false
        },

        async importCompanyGroups(payload) {
            this.isLoadingImportCompanyGroups = true
            const formData = new FormData()

            formData.append('file', payload.file)
            map(payload.fields, el => {
                Object.keys(el).map(key => formData.append(key, el[key]))
            })
      
            const { data, statusCode } = await useApi(`company_groups/import`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            }).blob()
      
            if (statusCode.value != 201) {
                download(data.value, `groupe-société-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
                this.rowsError = 1
            }
      
            this.getCompanyGroups()
      
            this.isLoadingImportCompanyGroups = false
            
            return statusCode.value === 201
        },
    },
})
