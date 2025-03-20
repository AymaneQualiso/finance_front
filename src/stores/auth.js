import { destroyToken, getToken, saveToken } from "@/services/JwtService"
import { includes as _includes, cloneDeep, set } from "lodash"


import { AbilityBuilder } from '@casl/ability'
import { ABILITY_TOKEN } from '@casl/vue'
import { useCompanyStore } from "./company.store"


export const useAuthStore = defineStore("auth", () => {
  const router = useRouter()
  const errors = ref({})
  const user = ref({})
  const isAuthenticated = ref(!!getToken())
  const twoFactorAuth = ref(false)
  const passwordValidityHasBeenExpired = ref(false)
  const resetPasswordToken = ref(null)
  const twoFactorAuthCode = ref(null)
  const changePasswordFirstTime = ref(null)
  const { can } = useAbility()
  const Ability = useAbility()
  const ability = inject(ABILITY_TOKEN)
  const companyStore = useCompanyStore()
  const { connectedCompany, showModalCompanies, companies, userCompanies } = storeToRefs(companyStore)
  const avatar = ref()

  async function setAuth(authUser) {
    await saveToken(authUser.access_token)
    isAuthenticated.value = true
    await setUser(cloneDeep(authUser?.user_data))
  }

  async function setUser(userData) {
    const { can: authCan, rules } = new AbilityBuilder(Ability)
    user.value = userData
    connectedCompany.value = userData.company
    userCompanies.value = userData.companies
    
    if (_includes(userData?.roles, 'super admin')) {
      showModalCompanies.value = false
    } else if(Array.isArray(userData.company) && userData.company.length === 0){
      showModalCompanies.value = true
    } else{
      showModalCompanies.value = false
    }

    if (_includes(userData?.roles, 'super admin')) {
      await authCan('manage', 'all')
      await ability.update(rules)
    } else {
      await authCan(userData?.permissions ?? [])
      await ability.update(rules)
    }

    avatar.value = user.value.avatar
    // if(user.value.avatar_id)
    //   getAvatar({ idImg: user.value.avatar_id })
  }

  function setError(error) {
    errors.value = error
  }

  async function verifyTwoFactorAuthCode(payload) {
    setError({})
    const { data, error, statusCode } = await useApi('verify-two-factor-auth').post(payload)

    if (statusCode.value == 200) {
      await setAuth(cloneDeep(data.value))
      twoFactorAuth.value = false
    }
    else {
      await setError({ error: error.value, twoFactorStatusCode: statusCode.value })
    }
  }

  async function resendTwoFactorAuthCode(payload) {
    setError({})
    const { data, error, statusCode } = await useApi('resend-two-factor-auth').post(payload)

    if (statusCode.value !== 200)
      await setError({ error: error.value, resendTwoFactorStatusCode: statusCode.value })
  }


  async function login(credentials) {
    const { data, error, statusCode } = await useApi('login').post(credentials)

    if (statusCode.value == 200) {
      // change password first time
      if (data.value.change_password_first_time && data.value.reset_password_token) {
        changePasswordFirstTime.value = true
        resetPasswordToken.value = data.value.reset_password_token
        return
      }

      // password validity expirt check
      if (data.value.password_validity_expired && data.value.reset_password_token) {
        passwordValidityHasBeenExpired.value = true
        resetPasswordToken.value = data.value.reset_password_token
        return
      }

      // 2fa
      if (data.value.two_factor_auth) {
        twoFactorAuth.value = true
        return
      }

      await setAuth(cloneDeep(data.value))
    }
    else {
      await setError({ error: error.value, statusCode: statusCode.value })
    }
  }

  async function sendPasswordResetLink(credentials) {
    const { data, statusCode } = await useApi('auth/send_password_reset_link').post(credentials)

    return { statusCode: statusCode.value, data: data.value }
  }

  async function resetPassword(credentials) {
    const { data, statusCode } = await useApi('auth/reset_password').post(credentials)

    return { statusCode: statusCode.value, data: data.value }
  }

  async function loadAuth() {
    const { data, statusCode } = await useApi('users/get_user_info').get()

    if (statusCode.value == 200) {
      isAuthenticated.value = true
      await setUser(cloneDeep(data.value?.data))
    }
  }

  async function getAvatar(payload){
    isLoadingAvatar.value = true

    const { data, statusCode } = await useApi(`users/get_user_avatar/${payload.idImg}`).blob()

    if(statusCode.value === 200){
      avatar.value = imgUrl(data.value, { type: data.value.type })
    }
    isLoadingAvatar.value = false
  }

  async function logout() {
    // authCan([])
    // ability.update(rules)
    isAuthenticated.value = false
    setUser({})
    setError({})
    await destroyToken()
    await router.push({ name: "login" })
  }

  async function forgotPassword(email) {
    setError({})

    const { data, error, statusCode } = await useApi('forgot-password').post({ email })

    if (statusCode.value !== 200)
      setError({ error: error.value, statusCode: statusCode.value })
  }

  function canNavigate(to) {
    if (to.meta?.permission) return can(to.meta.permission)

    return to.matched.some(route => !route.meta.permission || can(route.meta.permission))
  }

  function canViewNavMenuGroup(item) {
    const hasAnyVisibleChild = item.children.some(i => !i.permission || can(i.permission))

    // If subject and action is defined in item => Return based on children visibility (Hide group if no child is visible)
    // Else check for ability using provided subject and action along with checking if has any visible child
    if (!(item.permission))
      return hasAnyVisibleChild

    return can(item.permission) && hasAnyVisibleChild
  }

  return {
    errors,
    user,
    setUser,
    loadAuth,
    isAuthenticated,
    twoFactorAuth,
    twoFactorAuthCode,
    passwordValidityHasBeenExpired,
    resetPasswordToken,
    changePasswordFirstTime,
    verifyTwoFactorAuthCode,
    avatar,
    getAvatar,
    login,
    logout,
    forgotPassword,
    canNavigate,
    canViewNavMenuGroup,
    sendPasswordResetLink,
    resetPassword,
    resendTwoFactorAuthCode
  }
})
