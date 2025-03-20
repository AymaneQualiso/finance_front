import { map } from "lodash";

export const useAttachmentStore = defineStore({
  id: "attachments",
  state: () => ({
    isLoading: false,
    isUploading: false,
    isDownloading: false,
    records: [],
    total: 0,
    filter: {},
  }),
  actions: {
    async getAllRecords() {
      this.isLoading = true

      const { data, statusCode } = await useApi(`attachment?per_page=100`)

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

      const { data, statusCode } = await useApi(`attachment${query}`)

      if (statusCode.value == 200) {
        this.records = data.value.data
        this.total = data.value.meta.total
      }

      this.isLoading = false
    },

    async addRecord(payload) {
      this.isUploading = true

      const formData = new FormData()

      map(payload, (el, key) => {
        formData.append(key, el)
      })

      const { data, statusCode } = await useApi("attachment", {
        method: "POST",
        headers: { "Content-Type": null },
        body: formData,
      })

      if (statusCode.value == 201) {
        this.getRecords({
          'modelable_type': `App\\Model\\${payload.modelable_type}`,
          'modelable_id': payload.modelable_id,
        })
      }
      this.isUploading = false
      
      return statusCode.value == 201
    },

    async deleteRecord(payload) {
      const { data, statusCode } = await useApi(`attachment/${payload.id}`, {
        method: "DELETE",
      })

      if (statusCode.value == 200) {
        this.getRecords()
      }

      return statusCode.value == 200
    },

    async downloadAttachment(payload){      
      this.isDownloading = true

      const { data, statusCode } = await useApi(`download-attachment/${payload.id}`).blob()

      if(statusCode.value === 200){
        download(data.value, payload.file_name, { type: data.value.type }).click()
      }
      this.isDownloading = false
    },
  },
})
