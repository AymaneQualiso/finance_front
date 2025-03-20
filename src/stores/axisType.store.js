import { map } from "lodash";
import { defineStore } from "pinia";

export const useAxisTypeStore = defineStore({
    id: "axisType",
    state: () => ({
        isLoadingAxisType: false,
        isExportingAxisType: false,
        isLoadingImportAxisType: false,
        axisTypes: [],
        currentAxisType: {},
        total: 0,
        filter: {},
        fieldsData: {
            'Libellé': 'label',
            'Status': 'is_active',
            'Requis': 'is_required',
        },
        requiredFieldsData: ['label', 'is_active', 'is_required'],
    }),
    actions: {

        
        async getAxisTypes(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingAxisType = true

            const { data, statusCode } = await useApi(`axis_types${query}`)

            this.axisTypes = data.value.data
            localStorage.setItem(
                "cachedAxisTypes",
                JSON.stringify(this.axisTypes)
              );
            this.total = data.value.meta.total
            this.isLoadingAxisType = false

            return statusCode.value === 200
        },

        async getOnlyIdLabelAxisTypes(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingAxisType = true

            const { data, statusCode } = await useApi(`axis_types/getOnlyIdLabel?${query}`)

            this.axisTypes = data.value.data
            this.isLoadingAxisType = false

            return statusCode.value === 200
        },

        async getAxisType(id) {
            this.isLoadingAxisType = true

            const { data, statusCode } = await useApi(`axis_types/${id}`)

            if (statusCode.value === 200) {
                this.currentAxisType = data.value
            }
            this.isLoadingAxisType = false
        },

        async createAxisType(payload) {
            this.isLoadingAxisType = true;

            const formData = new FormData();
            map(payload, (el, key) => {
                formData.append(key, el)
            })

            const { statusCode, data } = await useApi("axis_types", {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 201) {
                this.getAxisTypes()
            } 

            this.isLoadingAxisType = false;
            
            return { statusCode: statusCode.value, data: data.value }
        },

        async updateAxisType(payload) {
            this.isLoadingAxisType = true;

            const formData = new FormData();
            formData.append('_method', 'PUT')

            map(payload, (el, key) => {
                formData.append(key, el === null ? "" : el);
            });

            const { data, statusCode } = await useApi(`axis_types/${payload.id}`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 200) {
                this.getAxisTypes()
            } 

            this.isLoadingAxisType = false;

            return { statusCode: statusCode.value, data: data.value }
        },

        async deleteAxisType(payload) {
            this.isLoadingAxisType = true;
            
            const { statusCode } = await useApi(`axis_types/${payload}`).delete();

            if (statusCode.value === 200) {
                this.getAxisTypes()
            }

            this.isLoadingAxisType = true;

            return statusCode.value === 200
        },
        async importAxisTypes(payload) {
            this.isLoadingImportAxisType = true
            const formData = new FormData()

            formData.append('file', payload.file)
            map(payload.fields, el => {
                Object.keys(el).map(key => formData.append(key, el[key]))
            })
      
            const { data, statusCode } = await useApi(`axis_types/import`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            }).blob()
      
            if (statusCode.value != 201) {
                download(data.value, `axis-types-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
                this.rowsError = 1
            }
      
            this.getAxisTypes()
      
            this.isLoadingImportAxisType = false
            // let res = (statusCode === 201 && !data.length) ? true : false
            
            return statusCode.value === 201
        },
        async exportList(ids) {
            this.filter = { ...this.filter, ...ids };
        
            let query = getQuery(this.filter);

            this.isExportingAxisType = true
        
            const { data, statusCode } = await useApi(`axis_types/export${query}`).blob();
        
            if(statusCode.value === 200) {
              download(data.value, `Types d\'axes.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }
        
            this.isExportingAxisType = false
        }
    },
})
