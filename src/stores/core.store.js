import { defineStore } from "pinia"

export const useCoreStore = defineStore({
  id: "core",
  state: () => ({
    isLoading: false,
    enums: [],
  }),
  actions: {
    async getEnums() {
      this.isLoading = true

      const { data, statusCode } = await useApi(`core/enums`)
      if (statusCode.value === 200) {
        this.enums = data.value
      }
      this.isLoading = false
    },
  },
})
