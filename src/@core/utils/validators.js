import { getI18n } from '@/plugins/i18n/index'
import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'

const t = getI18n().global.t

// 👉 Required Validator
export const requiredValidator = value => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return t('Validator.This field is required')

  return !!String(value).trim().length || t('Validator.This field is required')
}

// 👉 Email Validator
export const emailValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || t('Validator.The Email field must be a valid email')

  return re.test(String(value)) || t('Validator.The Email field must be a valid email')
}

// 👉 Password Validator
export const passwordValidator = password => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/
  const validPassword = regExp.test(password)

  return validPassword || t('Validator.Field must contain at least one uppercase, lowercase, special character and digit with min 8 chars')
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value, target) => value === target || t('Validator.The Confirm Password field confirmation does not match')

// 👉 Between Validator
export const betweenValidator = (value, min, max) => {
  const valueAsNumber = Number(value)

  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || t(`Validator.Enter number between`, { min, max })
}

// 👉 Integer Validator
export const integerValidator = value => {
  if (isEmpty(value))
    return true
  if (Array.isArray(value))
    return value.every(val => /^-?[0-9]+$/.test(String(val))) || t('Validator.This field must be an integer')

  return /^-?[0-9]+$/.test(String(value)) || t('Validator.This field must be an integer')
}

// 👉 Regex Validator
export const regexValidator = (value, regex) => {
  if (isEmpty(value))
    return true
  let regeX = regex
  if (typeof regeX === 'string')
    regeX = new RegExp(regeX)
  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))

  return regeX.test(String(value)) || t('Validator.The Regex field format is invalid')
}

// 👉 Alpha Validator
export const alphaValidator = value => {
  if (isEmpty(value))
    return true

  return /^[A-Z]*$/i.test(String(value)) || t('Validator.The Alpha field may only contain alphabetic characters')
}

// 👉 URL Validator
export const urlValidator = value => {
  if (isEmpty(value))
    return true
  const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/

  return re.test(String(value)) || t('Validator.URL is invalid')
}

// 👉 Length Validator
export const lengthValidator = (value, length, minLength = 0) => {
  if (isEmpty(value))
    return true
  if (minLength != 0) {
    return (String(value).length >= minLength && String(value).length <= length) || t(`Validator.The field must contain between characters`, { minLength, length })
  }
  return String(value).length === length || t(`Validator.The Min Character field must be at least characters`, { length })
}

// 👉 Alpha-dash Validator
export const alphaDashValidator = value => {
  if (isEmpty(value))
    return true
  const valueAsString = String(value)

  return /^[0-9A-Z_-]*$/i.test(valueAsString) || t('Validator.All Character are not valid')
}

// 👉 Max Length Validator
export const maxLengthValidator = (value, max) => {
  return (Number(max) >= value?.length) || t(`Validator.The Max Character field must be 5 characters `, { max })
}

// 👉 Min Length Validator
export const minLengthValidator = (value, minLength) => {
  if (isEmpty(value))
    return true;

  return String(value).length >= minLength || t('Validator.MinLengthMessage', { minLength });
}

export const allSelectChipsShouldBeEmailValidator = (value) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || t('Validator.All entries should be email')
}
