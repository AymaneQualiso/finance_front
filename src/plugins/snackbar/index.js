import useSnackbar from './snackbar.store'

export default function (app) {
  // const snackbarStore= useSnackbar()

  app.config.globalProperties.$showSnackbar = useSnackbar().showSnackbar

  app.provide("showSnackbar", useSnackbar().showSnackbar)
}
