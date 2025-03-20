import { defineStore } from "pinia"

export const useAttachmentTypeStore = defineStore({
  id: "attachment_types",
  state: () => ({
    isLoading: false,
    records: [],
    total: 0,
    filter: {},
  }),
  actions: {
    async getAllRecords() {
      this.isLoading = true

      const { data, statusCode } = await useApi(`attachment-types?per_page=100`)

      if (statusCode.value == 200) {
        this.records = data.value.data
        this.total = data.value.meta.total
      }

      this.isLoading = false
    },

    async getRecords(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload)
      let query = getQuery(this.filter)
      this.isLoading = true

      const { data, statusCode } = await useApi(`attachment-types${query}`)

      if (statusCode.value == 200) {
        this.records = data.value.data
        this.total = data.value.meta.total
      }

      this.isLoading = false
    },

    async addRecord(payload) {
      const { data, statusCode } = await useApi("attachment-types", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (statusCode.value == 201) {
        this.getRecords()
      }

      return statusCode.value == 201
    },

    async updateRecord(payload) {
      const { data, statusCode } = await useApi(`attachment-types/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      if (statusCode.value == 200) {
        this.getRecords()
      }

      return statusCode.value == 200
    },

    async deleteRecord(payload) {
      const { data, statusCode } = await useApi(`attachment-types/${payload.id}`, {
        method: "DELETE",
      })

      if (statusCode.value == 200) {
        this.getRecords()
      }

      return statusCode.value == 200
    },
  },
})
