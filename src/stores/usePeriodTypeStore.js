import { map } from "lodash";
import { defineStore } from "pinia";

export const usePeriodTypeStore = defineStore("periodType", () => {
  const isLoadingPeriodType = ref(false);
  const isExportingPeriodType = ref(false);
  const isLoadingImportPeriodType = ref(false);
  const periodTypes = ref([]);
  const currentPeriodType = ref({});
  const total = ref(0);
  const filter = ref({});
 

  async function fetchPeriodTypes(queryParams = {}) {
    let query = getQuery(queryParams);
  
    const { data, statusCode } = await useApi(`period-types${query}`).get();
  
    periodTypes.value = data.value?.data;
  
    return { statusCode: statusCode.value, data: data.value };
  }

// async function fetchPeriodTypes(queryParams = {}) {
  
//     let query = getQuery(queryParams);
  
//     try {
//       const { data, statusCode } = await useApi(`period-types${query}`).get();
  
//       if (statusCode.value === 200) {
//         periodTypes.value = data.value.data;
//       } else {
//         console.warn("fetchPeriodTypes: Non-200 status code received:", statusCode.value);
//       }
  
//       return { statusCode: statusCode.value, data: data.value.data };
//     } catch (error) {
//       console.error("fetchPeriodTypes: Error occurred during API call:", error);
//       throw error; // Rethrow the error for handling upstream
//     } finally {
// //     }
// //   }

// async function fetchPeriodTypes(queryParams = {}) {
  
  
//     let query = getQuery(queryParams);

  
//     try {
//       const { data, statusCode } = await useApi(`period-types${query}`).get();
    
  
//       if (statusCode.value === 200) {

//         periodTypes.value = (data.value?.data || []).map(item => ({
//           id: item.id,
//           label: item.label,
//         }));
//       } else {
//         console.warn("fetchPeriodTypes: Non-200 status code received:", statusCode.value);
//       }
  
//       return { statusCode: statusCode.value, data: periodTypes.value };
//     } catch (error) {
//       throw error; // Rethrow the error for handling upstream
//     } finally {
//     }
//   }
  
  
  

  async function getPeriodTypes(filterPayload = {}) {
    filter.value = { ...filter.value, ...filterPayload };
    let query = getQuery(filter.value);
    isLoadingPeriodType.value = true;

    try {
      const { data, statusCode } = await useApi(`period-types${query}`).get();
      if (statusCode.value === 200) {
        periodTypes.value = data.value?.data || [];
        total.value = data.value?.total || 0;
      }
    } catch (error) {
      console.error("getPeriodTypes: Error fetching period types:", error);
    } finally {
      isLoadingPeriodType.value = false;
    }
  }

  async function getPeriodType(id) {
    isLoadingPeriodType.value = true;

    try {
      const { data, statusCode } = await useApi(`period_types/${id}`).get();
      if (statusCode.value === 200) {
        currentPeriodType.value = data.value || {};
      }
    } catch (error) {
      console.error("getPeriodType: Error fetching period type:", error);
    } finally {
      isLoadingPeriodType.value = false;
    }
  }

  async function createPeriodType(payload) {
    isLoadingPeriodType.value = true;

    const formData = new FormData();
    map(payload, (value, key) => formData.append(key, value));

    try {
      const { statusCode } = await useApi("period_types").post(formData, {
        headers: { "Content-Type": null },
      });

      if (statusCode.value === 201) {
        await getPeriodTypes();
      }
    } catch (error) {
      console.error("createPeriodType: Error creating period type:", error);
    } finally {
      isLoadingPeriodType.value = false;
    }
  }

  async function updatePeriodType(payload) {
    isLoadingPeriodType.value = true;

    const formData = new FormData();
    formData.append("_method", "PUT");
    map(payload, (value, key) => formData.append(key, value || ""));

    try {
      const { statusCode } = await useApi(`period_types/${payload.id}`).post(formData, {
        headers: { "Content-Type": null },
      });

      if (statusCode.value === 200) {
        await getPeriodTypes();
      }
    } catch (error) {
      console.error("updatePeriodType: Error updating period type:", error);
    } finally {
      isLoadingPeriodType.value = false;
    }
  }

  async function deletePeriodType(id) {
    isLoadingPeriodType.value = true;

    try {
      const { statusCode } = await useApi(`period_types/${id}`).delete();

      if (statusCode.value === 200) {
        await getPeriodTypes();
      }
    } catch (error) {
      console.error("deletePeriodType: Error deleting period type:", error);
    } finally {
      isLoadingPeriodType.value = false;
    }
  }

  async function importPeriodTypes(payload) {
    isLoadingImportPeriodType.value = true;

    const formData = new FormData();
    formData.append("file", payload.file);
    map(payload.fields, (field) => {
      Object.keys(field).forEach((key) => formData.append(key, field[key]));
    });

    try {
      const { data, statusCode } = await useApi("period_types/import", {
        method: "POST",
        headers: { "Content-Type": null },
        body: formData,
      }).blob();

      if (statusCode.value !== 201) {
        download(data.value, "period-types-error.xlsx", {
          type: "application/vnd.ms-excel",
        }).click();
      } else {
        await getPeriodTypes();
      }
    } catch (error) {
      console.error("importPeriodTypes: Error importing period types:", error);
    } finally {
      isLoadingImportPeriodType.value = false;
    }
  }

  async function exportList(ids) {
    filter.value = { ...filter.value, ...ids };
    let query = getQuery(filter.value);
    isExportingPeriodType.value = true;

    try {
      const { data, statusCode } = await useApi(`period_types/export${query}`).blob();
      if (statusCode.value === 200) {
        download(data.value, "Types de périodes.xlsx", {
          type: "application/vnd.ms-excel",
        }).click();
      }
    } catch (error) {
      console.error("exportList: Error exporting period types:", error);
    } finally {
      isExportingPeriodType.value = false;
    }
  }

  return {
    // State
    isLoadingPeriodType,
    isExportingPeriodType,
    isLoadingImportPeriodType,
    periodTypes,
    currentPeriodType,
    total,
    filter,
   

    // Actions
    fetchPeriodTypes,
    getPeriodTypes,
    getPeriodType,
    createPeriodType,
    updatePeriodType,
    deletePeriodType,
    importPeriodTypes,
    exportList,
  };
});
