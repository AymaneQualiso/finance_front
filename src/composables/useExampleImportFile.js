import { ref } from "vue";

export const useExampleImportFile = (router) => {
  if (!router) {
    throw new Error('useExampleImportFile requires a router instance');
  }

  const { meta } = router.currentRoute.value;
  const exampleFileUrl = ref('');

  const fetchExampleFIle = async (importType = '') => {
    try {
      const savedImportType = importType || localStorage.getItem('importType') || '';
      console.log('Using importType:', savedImportType);

      const queryParam = meta.moduleName == "balances" ? (savedImportType ? `?import_type_balance=${savedImportType}` : '') : '';
      const { data, statusCode } = await useApi(`importModels/example/${meta.moduleName}${queryParam}`).get();

      if (statusCode.value === 200) {
        exampleFileUrl.value = data.value.file_url_download;
      }
    } catch (error) {
      console.error('Error fetching example file:', error);
      exampleFileUrl.value = '';
    }
  };

  return {
    exampleFileUrl,
    fetchExampleFIle,
  };
};
