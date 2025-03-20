import { storeToRefs } from "pinia";
import {useCoreStore, useExerciceStore, useCompanyStore, useChartAccountStore, usePaymentdelayStore } from "@/stores";


export function usePaymentDelay(t = e => e, showSnackbar) {
  const paymentstoreStore = usePaymentdelayStore();
  const { isExportingBgConsolide, total, filter, isLoadingPaymentdelay, paymentdelays, natureOptions } = storeToRefs(paymentstoreStore);
  const exerciceStore = useExerciceStore();
  const { exercices } = storeToRefs(exerciceStore);
  const coreStore = useCoreStore();
  const { enums } = storeToRefs(coreStore);
  const companyStore = useCompanyStore();
   
  const { companies: companiesData } = storeToRefs(companyStore);
  const chartAccountStore = useChartAccountStore();
  const { chartAccounts } = storeToRefs(chartAccountStore);
  const sendForm = ref(null);
  const selected = ref([]);
  const isInsertbgConsolidesDialogShown = ref(false);
  const companies = ref([]);

  const headers = ref([
    {
      title: "Société",
      sortable: true,
      key: "company",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "N° Facture Sage",
      sortable: true,
      key: "number_invoice_sage",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Fournisseur",
      sortable: true,
      key: "supplier",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "IF",
      sortable: true,
      key: "if",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Adresse Siège Sociale",
      sortable: true,
      key: "head_office_address",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
   
    {
      title: "Etat Facture",
      sortable: true,
      key: "invoice_status",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "N° Fact Frs",
      sortable: true,
      key: "number_invoice_frs",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Montant facture  TTC",
      sortable: true,
      key: "invoice_amount_ttc",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Mnt Non encore payé",
      sortable: true,
      key: "amount_not_yet_paid",
      filtervalue: "",
      filterable: true,
      typefilter: "range",
    },
    {
      title: "Nature marchandise",
      sortable: true,
      key: "merchandise_nature",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Date Liv. marchandise",
      sortable: true,
      key: "date_liv_marchandise",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: "Date Emission",
      sortable: true,
      key: "date_emission",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: "Délai de Paiement",
      sortable: true,
      key: "payment_delay",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Date prévpaiem",
      sortable: true,
      key: "date_prevpaiem",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: "Date Réleve",
      sortable: true,
      key: "date_releve",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: "Mnt payé horsdélai",
      sortable: true,
      key: "mnt_paye_horsdelai",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Date paiement hors délai",
      sortable: true,
      key: "date_paiement_hors_delai",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: "Mode de paiement",
      sortable: true,
      key: "mode_de_paiement",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Référence paiement",
      sortable: true,
      key: "reference_paiement",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Hors délai",
      sortable: true,
      key: "hors_delai",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Date Creation",
      sortable: true,
      key: "date_creation",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    }, 
    {
      title: "Numero Piece",
      sortable: true,
      key: "numero_piece",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    },
    {
      title: "Observation",
      sortable: true,
      key: "observation",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    }, 
    {
      title: "statut",
      sortable: true,
      key: "statut",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },  
    {
      title: "Nature OBS",
      sortable: true,
      key: "naturename",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },  
    {
      title: "OBS",
      sortable: true,
      key: "obs",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Modifié par",
      sortable: true,
      key: "updated_by.name",
      filtervalue: "",
      filterable: true,
      typefilter: "text",
    },
    {
      title: "Modifié le",
      sortable: true,
      key: "updated_at",
      filtervalue: "",
      filterable: true,
      typefilter: "date",
    }, 
    {
      title: "",
      sortable: false,
      key: "actions",
    },
  ]);
    

  const router = useRouter();

  function changeFilter(...payload) {
    paymentstoreStore.getPaymentDelayspayload(...payload);

    // paymentstoreStore.getPaymentDelays(...payload)
  }

  function openModal() {
    isInsertbgConsolidesDialogShown.value = true;
    if (chartAccounts.value.length === 1) {
    //   currentBgConsolide.value.chartaccount_id = chartAccounts.value[0].id;
    }
  }

  function statusCpcAndBilanColor(status) {
    switch (status) {
    case enums.value.cpcStatus.VALIDEE:
      return 'bg-success';
    case enums.value.cpcStatus.BROUILLON:
      return 'bg-warning';
    case null:
    case '':
      return 'bg-error';
    default:
      return '';
    }
  }
  function getIsBgPaymentDelayColor(status) {
    switch (status) {
    case 'En cours':
      return 'info';
    case 'Non traité':
      return 'error';  
    case 'Traité':
      return 'success';
    default:
      return '';
    }
  }

  async function getData(routeName) {
    try {
     

      // const route = useRoute();
       console.log("Route Name:", routeName);
      // console.log("Route Name Length:", route.name.length);

      const routeType = routeName == "payment-list-new" ? 'new' : 'all';

    console.log("routerType", routeType);
    
      if (routeType == 'all') {
        await paymentstoreStore.getPaymentDelays();
      } else if (routeType == 'new') {
        await paymentstoreStore.getNewPaymentDelays(); 
      }
    } catch (error) {
      showSnackbar(t('An error occurred while fetching data.'), 'error');
    }
  }
  async function updateRecords(...payload) {
      
    await paymentstoreStore.updateRecordspaymentdelays(...payload);
       
  }

 async function fetchNatureObsOptions(){
      
    await paymentstoreStore.getNatureObs();
       
  }
  async function exportExcel() {
    await paymentstoreStore.exportList({ ids: selected.value });
}
  
  return {
    enums,
    router,
    headers,
    selected,
    sendForm,
    companies,
    companiesData,
    chartAccounts,
    isInsertbgConsolidesDialogShown,
    isExportingBgConsolide,
    isLoadingPaymentdelay, 
    
    paymentdelays,
    exercices,
    total, 
    filter,

    // bgConsolidStore,
    statusCpcAndBilanColor,
    changeFilter,
    openModal,
    getData,
    updateRecords,
    fetchNatureObsOptions,
    natureOptions,
    exportExcel,
    getIsBgPaymentDelayColor,
  };
}
