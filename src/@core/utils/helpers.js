import { map } from "lodash"

// 👉 IsEmpty
export const isEmpty = value => {
  if (value === null || value === undefined || value === '')
    return true

  return !!(Array.isArray(value) && value.length === 0)
}

// 👉 IsNullOrUndefined
export const isNullOrUndefined = value => {
  return value === null || value === undefined
}

// 👉 IsEmptyArray
export const isEmptyArray = arr => {
  return Array.isArray(arr) && arr.length === 0
}

// 👉 IsObject
export const isObject = obj => obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)

// 👉 IsToday
export const isToday = date => {
  const today = new Date()

  return (date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear())
}


export const imgPath = (url, path = "/src/assets/images/camera-icon.png") => {
  if (url && typeof url === 'object' && url.length) return URL.createObjectURL(url[0])

  return url ? url : path
}

export const download = (data, name, type) => {
  const url = window.URL.createObjectURL(new Blob([data], { type }))
  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', name)
  document.body.appendChild(link)

  return link

  // link.click()
  // setTimeout(() => {
  //   document.body.removeChild(link)
  //   window.URL.revokeObjectURL(url)
  // }, 200)
}

export const getQuery = (...filter) => {
  let query = "?"
  let params = Object.assign({}, ...filter)
  map(params, (el, key) => {
    if(typeof el === "object"){
      if (el.start) query += `${key}_start=${el.start}&`
      if (el.end) query += `${key}_end=${el.end}&`
      else {
        query += map(el, item => `${key}[]=${item}`).join("&") + "&"
      }
    }else {
      query = query + `${key}=${el}&`
    }
  })

  return query
}


export const getEnums = (enums, t) => {
  return Object.keys(enums).map(obKey => {
    return { key: enums[obKey], title: t(`Enums.${enums[obKey]}`) }
  })
}

export const checkValue = (val, text = 'N.C') => {
  return isEmpty(val) ? text : val
}

export const appComboboxErrorMessages = (val, t, label, msg) => {
  if (isEmpty(val)) {
    return msg ? msg : t('App Combobox Error Messages', { label: label })
  }

  return null

}
export const capitalizeFirstLetter = string => {
  return string?.charAt(0).toUpperCase() + string?.slice(1).toLowerCase()
}

export const imgUrl = (data, type) => {
  if(data) return window.URL.createObjectURL(new Blob([data], { type }))
  
  return ""
}
