import { isToday } from './helpers'

export const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')
  
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

// TODO: Try to implement this: https://twitter.com/fireship_dev/status/1565424801216311297
export const kFormatter = num => {
  const regex = /\B(?=(\d{3})+(?!\d))/g
  
  return Math.abs(num) > 9999 ? `${Math.sign(num) * +((Math.abs(num) / 1000).toFixed(1))}k` : Math.abs(num).toFixed(0).replace(regex, ',')
}

/**
 * Format and return date in Humanize format
 * Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 * Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {string} value date to format
 * @param {Intl.DateTimeFormatOptions} formatting Intl object to format with
 */
export const formatDate = (value, formatting = { month: 'numeric', day: 'numeric', year: 'numeric' }) => {
  if (!value)
    return value
  
  return new Intl.DateTimeFormat('fr', formatting).format(new Date(value))
}

/**
 * 
 */
export const newformatDate = (value, formatting = { month: 'numeric', day: 'numeric', year: 'numeric' }) => {
  if (!value) return value;

  const [datePart, timePart] = value.split(' ');
  const [day, month, year] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  const parsedDate = new Date(year, month - 1, day, hours, minutes, seconds);
  
  if (isNaN(parsedDate)) {
    console.error('Invalid date format:', value);
    return value;
  }

  return new Intl.DateTimeFormat('fr', formatting).format(parsedDate);
};
export const newformatDateWithHourAndMinute = (
  value, 
  formatting = { 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }
) => {
  if (!value) return value;

  const [datePart, timePart] = value.split(' ');
  const [day, month, year] = datePart.split('-').map(Number);
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number);

  const parsedDate = new Date(year, month - 1, day, hours, minutes);
  
  if (isNaN(parsedDate)) {
    console.error('Invalid date format:', value);
    return value;
  }

  return new Intl.DateTimeFormat('fr', formatting).format(parsedDate);
};


/**
 * Return short human friendly month representation of date
 * Can also convert date to only time if date is of today (Better UX)
 * @param {string} value date to format
 * @param {boolean} toTimeForCurrentDay Shall convert to time if day is today/current
 */
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting = { month: 'short', day: 'numeric' }
  if (toTimeForCurrentDay && isToday(date))
    formatting = { hour: 'numeric', minute: 'numeric' }
  
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}
export const prefixWithPlus = value => value > 0 ? `+${value}` : value

export const formatNumber = (val, digits = 4) => {
  let num = Number(val).toFixed(digits)
  
  return numberWithSpaces(num) 
}

export const numberWithSpaces = x => {
  var parts = x.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  
  return parts.join(".")
}
