const TOKEN = "accessToken"

/**
 * @description get token form localStorage
 */
export const getToken = () => {
  return window.localStorage.getItem(TOKEN)
}

/**
 * @description save token into localStorage
 * @param token: string
 */
export const saveToken = token => {
  window.localStorage.setItem(TOKEN, token)
}

/**
 * @description remove token form localStorage
 */
export const destroyToken = () => {
  window.localStorage.removeItem(TOKEN)
}

export default { getToken, saveToken, destroyToken }
