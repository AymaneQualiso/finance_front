import {
  useAttachmentStore,
  useCoreStore,
  useInventoryPlansStore,
  useUserStore,
} from "@/stores"
import { cloneDeep } from "lodash"

export function useInventoryPlan(t = e => e, showSnackbar) {
  const storeInventoryPlans = useInventoryPlansStore()
  const { currentInventoryPlan } = storeToRefs(storeInventoryPlans)
  const showModalAttachments = ref(false)
  const attachmentStore = useAttachmentStore()
  const router = useRouter()
  const route = useRoute()
  const modelAble = ref({ class: "InventoryPlan" })
  const userStore = useUserStore()
  const coreStore =  useCoreStore()
  const errors = ref(null)

  const { 
    inventoryPlans, 
    isLoading, 
    total, 
    filter, 
    isExporting,
    isSending,
    isReopening,
  } = storeToRefs(storeInventoryPlans)

  const { enums } =  storeToRefs(coreStore)
  const { users } = storeToRefs(userStore)

  const headers = ref([
    {
      title: t('Name'),
      sortable: true,
      key: "name",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: t('InvPlanMd.Reference'),
      sortable: true,
      key: "reference",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: t('InvPlanMd.Responsible'),
      sortable: true,
      key: "responsible_name",
      filtervalue: "",
      filterable: true,
      typefilter: "select",
      selectvalue: users,
      itemKey: "id",
      itemTitle: "name",
    },
    {
      title: t('Start at'),
      sortable: true,
      key: "start_at",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: t('End at'),
      sortable: true,
      key: "end_at",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: t('Status'),
      sortable: true,
      key: "status",
      filtervalue: "",
      filterable: true,
      typefilter: "select",
      selectvalue: getEnums(enums.value.inventoryStatus, t),
      itemKey: "key",
      itemTitle: "title",
    },
    {
      title: "",
      sortable: false,
      key: "actions",
    },
  ])

  const isDeleteDialogVisible = ref(false)
  const rememberId = ref(null)
  const selected = ref([])
  
  async function getData(){
    if(isEmpty(users.value)) userStore.getUsers()
  }
    

  function closeModalAttachments(){
    showModalAttachments.value = false
    modelAble.value.id = null
  }
  
  
  function openModalAttachments(id){
    showModalAttachments.value = true
    modelAble.value.id = id 
  }

  function uploadAttachment(form){
    let res = attachmentStore.addRecord(form)
    if(res){
      showSnackbar(t('Added ok'), { color: "success" })
    }
  }

  function deleteAttachment(id){
    let res = attachmentStore.deleteRecord({ id: id })
    if(res){
      showSnackbar(t('Deleted ok'), { color: "success" })
    }
  }
  
  function downloadAttachment(item){
    let res = attachmentStore.downloadAttachment(item)
    if(res){
      showSnackbar(t('Downloaded ok'), { color: "success" })
    }
  }

  function changeFilter(...obj) {
    storeInventoryPlans.getInventoryPlans(...obj)
  }
  
  function openConfirmationModal(item) {
    rememberId.value = item.id
    isDeleteDialogVisible.value = true
  }
  
  async function deleteInventoryPlan() {
    const res = await storeInventoryPlans.deleteInventoryPlan({
      id: rememberId.value,
    })

    if (res) {
      showSnackbar(t('Deleted ok', { model: t('InvPlanMd.Inventory Plan') }))
      rememberId.value = null
      isDeleteDialogVisible.value = false
    }
  }

  function redirectToForm(item, action, query = null)
  {
    currentInventoryPlan.value = cloneDeep(item)
    router.push({
      name: "inventory-plan-form-inventory-plan-action?id?",
      params: { id: item?.id, action: action },
      query,
    })
  }

  function redirectToBack() {
    router.push(route.query.src)
  }

  async function exportPlanInvent(format){
    await storeInventoryPlans.exportPlanInvent({ format: format, ids: selected.value })
  }

  async function sendExcelToMails(mails){
    let res = await storeInventoryPlans.sendExcelToMails({ mails: mails, ids: selected.value })
    if(res){
      showSnackbar(t('Send mail ok', { model: t('InvPlanMd.Inventory Plan') }), { color: "success" })
    }
  }

  function addInventoryPlan(dataForm, form) {
    
    dataForm.validate().then(async ({ valid }) => {
      if (!valid) return
      errors.value = null
      form.responsible_id = form.responsible_id?.id
        ? form.responsible_id?.id
        : form.responsible_id
  
  
      if (!route.params.id) {
        const { res, item, statusCode, data } = await storeInventoryPlans.addInventoryPlan(form)
        if(statusCode === 422) {
          errors.value = data.errors
          showSnackbar(data.message ?? t("please fix errors"), { color: 'error' })
        }
        if (res) {
          showSnackbar(t('Added ok', { model: t('InvPlanMd.Inventory Plan') }), { color: "success" })
          redirectToForm(item, "show")
        }
      } else if (route.params.id) {
        form.id = route.params.id
  
        const { res, statusCode, data } = await storeInventoryPlans.updateInventoryPlan(form)
        if(statusCode === 422) {
          errors.value = data.errors
          showSnackbar(data.message ?? t("please fix errors"), { color: 'error' })
        }
        if (res) {
          showSnackbar(t('Updated ok', { model: t('InvPlanMd.Inventory Plan') }), { color: "success" })
          redirectToBack()
        }
      }
    })
  }

  async function onReopen(invId) {
    const { statusCode, data } = await storeInventoryPlans.reopen(invId)

    if(statusCode == 200) {
      currentInventoryPlan.value.status = data.data.status
      showSnackbar(t('the inventory plan has been successfully opened'), { color: "success" })
    }
    else if (statusCode == 422) showSnackbar(data.message, { color: 'error' })
    else showSnackbar(t('try again in a few seconds'), { color: 'error' })
  }
      
  return { 
    headers,
    isDeleteDialogVisible,
    modelAble,
    showModalAttachments,
    isSending,
    isExporting,
    selected,
    inventoryPlans,
    total,
    isLoading,
    filter,
    storeInventoryPlans,
    route,
    currentInventoryPlan,
    enums,
    users,
    getData,
    changeFilter,
    exportPlanInvent,
    redirectToForm,
    sendExcelToMails,
    deleteInventoryPlan,
    closeModalAttachments,
    openModalAttachments,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
    openConfirmationModal,
    redirectToBack,
    addInventoryPlan,
    onReopen,
    isReopening,
  }
}
  