import { getQuery } from "@/@core/utils/helpers"
import { defineStore } from "pinia"

export const useInventoryPlansStore = defineStore({
  id: "inventory_plans",
  state: () => ({
    isReopening: false,
    isLoading: false,
    isExporting: false,
    isSending: false,
    inventoryPlans: [],
    total: 0,
    filter: {},
    currentInventoryPlan: {},
  }),
  actions: {
    async getAllInventoryPlans(...payload) {
      this.isLoading = true

      const queryString = getQuery({ "per_page": 100 }, ...payload)

      const { data } = await useApi(`inventory-plans${queryString}`)

      if (data.value && data.value.data) {
        this.inventoryPlans = data.value.data
        this.total = data.value.meta.total
      }

      this.isLoading = false
    },

    async getInventoryPlans(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload)
      let query = getQuery(this.filter)
      this.isLoading = true

      const { data } = await useApi(`inventory-plans${query}`)

      if (data.value && data.value.data) {
        this.inventoryPlans = data.value.data
        this.total = data.value.meta.total
      }

      this.isLoading = false
    },

    async getInventoryPlan(id) {
      this.isLoading = true
  
      const { data } = await useApi(`inventory-plans/${id}`)
  
      if (data.value && data.value.data) {
        this.currentInventoryPlan = data.value.data
      }
  
      this.isLoading = false
    },

    async addInventoryPlan(payload) {
      const { data, statusCode } = await useApi("inventory-plans", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (statusCode.value == 200) {
        this.currentInventoryPlan = data.value.data
      }

      return { res: statusCode.value === 200, item: this.currentInventoryPlan, statusCode: statusCode.value, data: data.value }
    },

    async updateInventoryPlan(payload) {
      const { data, statusCode } = await useApi(`inventory-plans/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      if (statusCode.value == 200) {
        this.currentInventoryPlan = data.value.data
      }

      return { res: statusCode.value === 200, item: this.currentInventoryPlan, statusCode: statusCode.value, data: data.value }
    },

    async reopen(invPlnId){
      this.isReopening = true
  
      const { statusCode, data } = await useApi(`inventory-plans/reopen/${invPlnId}`).post()
  
      this.isReopening = false
  
      return { statusCode: statusCode.value, data: data.value }
    },

    async deleteInventoryPlan(payload) {
      const { data } = await useApi(`inventory-plans/${payload.id}`, {
        method: "DELETE",
      })

      if (data.value && data.value === "is deleted") {
        this.getInventoryPlans()
      }

      return data.value && data.value === "is deleted" ? true : false
    },


    async exportPlanInvent(payload){      
      let query = getQuery(this.filter, payload)
      this.isExporting = true

      const { data, statusCode } = await useApi(`export-inventory-plans${query}`).blob()

      if(statusCode.value === 200){
        download(data.value, `inventory-plans.${payload.format}`, { type: 'application/vnd.ms-excel' }).click()
      }
      this.isExporting = false
    },

    async sendExcelToMails(payload){
      let query = getQuery(this.filter, payload)
      this.isSending = true

      const { statusCode } = await useApi(`send-excel-inventory-plans-mail${query}`)

      this.isSending = false

      return statusCode.value === 200
    },
  },
})
