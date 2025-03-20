import { getToken } from "@/services/JwtService"
import { useAuthStore } from "@/stores"
import { createFetch } from "@vueuse/core"
import { destr } from "destr"
import { isEmpty, omitBy } from "lodash"


export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  fetchOptions: {
    headers: {
      Accept: "application/json",
    },
  },
  options: {
    refetch: false,
    updateDataOnError: true,
    async beforeFetch({ options }) {
      const accessToken = await getToken()
      if (accessToken) {
        
        options.headers = {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }

        options.headers = omitBy(options.headers, isEmpty)
      }

      return { options }
    },
    afterFetch(ctx) {
      const { data, response } = ctx

      // Parse data if it's JSON
      let parsedData = null
      try {
        parsedData = destr(data)
      } catch (error) {
        console.error(error)
      }

      return { data: parsedData, response }
    },

    async onFetchError(ctx) {
      if (ctx.response?.status === 401) {
        await useAuthStore().logout()
      }

      // Parse data if it's JSON
      const { data } = ctx
      let parsedData = null
      try {
        parsedData = destr(data)
      } catch (error) {
        console.error(error)
      }

      return { ...ctx, data: parsedData }
    },
  },
})
