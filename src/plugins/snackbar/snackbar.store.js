const useSnackbar = defineStore('snackbar', () => {
  const snackbar = reactive({
    show: false,
    message: '',
    props: {},
  })
    
  function showSnackbar(message, props = {}) {
    snackbar.show = true
    snackbar.message = message ?? ""
    snackbar.props = { "location": "top right", ...props }
  }
    
  return {
    snackbar,
    showSnackbar,
  }
})

export default  useSnackbar

