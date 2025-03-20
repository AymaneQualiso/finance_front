import { useAuthStore, useCoreStore } from '@/stores'
import { isEmpty } from "lodash"


export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(async to => {
    const authStore =  useAuthStore()
    const { user, isAuthenticated } =  storeToRefs(authStore)
    const coreStore =  useCoreStore()
    const { enums } =  storeToRefs(coreStore)


    /*
         * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
         * Examples of public routes are, 404, under maintenance, etc.
         * 
         */
    if (to.meta.public)
      return


    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */

    if (to.meta.unauthenticatedOnly) {
      if (isAuthenticated.value)
        return '/'
      else
        return undefined
    }

    /**
      * Check if token data exists in local storage and load user data is not found in auth store
      */
    if(isAuthenticated.value && isEmpty(user.value)) await authStore.loadAuth()

    if(isEmpty(enums.value)) await coreStore.getEnums()

    if (!authStore.canNavigate(to)) {
      return isAuthenticated.value
        ? { name: 'not-authorized' }
        : {
          name: 'login',
          query: {
            ...to.query,
            to: to.fullPath !== '/' ? to.path : undefined,
          },
        }
    }

    if (!isAuthenticated.value) {
      return  {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.path : undefined,
        },
      }
    }
  })
}
