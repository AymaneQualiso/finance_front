import { getQuery } from "@/@core/utils/helpers";
import { defineStore } from "pinia";

export const useStandarStore = defineStore({
  id: "standars",
  state: () => ({
   
    isSaving: false,
    isDeleting: false,
    isExporting: false,
    standars: [],
    total: 0,
    filter: {},
    currentStandar: {},
  }),
  actions: {
    // Fetch all standars with optional filters
    async getAllStandars(...payload) {
        this.isLoading = true;
      
        try {
          const queryString = getQuery({ per_page: 100 }, ...payload);
      
          const { data } = await useApi(`standars${queryString}`);
      
          if (data.value) {
            this.standars = data.value.data;
            this.total = data.value.total;
          }
        } catch (error) {
          console.error("Error in getAllStandars:", error);
        } finally {
          this.isLoading = false;
        }
      },
      

    // Fetch standars with filters from the filter state
    async getStandars(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;

      const { data } = await useApi(`standars${query}`);
      if (data.value ) {
        this.standars = data.value.data;
        this.total = data.value.total;
      }
      this.isLoading = false;
    },

    // async function getDTCompanies(...payload) {
    //   isCompaniesLoading.value = true
    //   if (payload) filters.value = Object.assign({}, filters.value, ...payload)
    
    //   const { data } = await fetchCompanies(filters.value)
    
    //   companies.value = data?.data
      
    // total.value = data?.meta?.total
    //   page.value = data?.meta?.current_page
    //   isCompaniesLoading.value = false
    // }

    // Fetch a single standar by ID
    // async getStandar(id) {
    //   this.isLoading = true;

    //   const { data } = await useApi(`standars/${id}`);
    //   if (data.value && data.value.data) {
    //     this.currentStandar = data.value.data;
    //   }
    //   this.isLoading = false;
    // },


    async getStandar(id) {
      try {
          this.isLoading = true;
  
          const { data } = await useApi(`standars/${id}`);
  
          if (data.value) {
              this.currentStandar = data.value;
          } else {
          }
      } catch (error) {
          console.error("Error fetching standard data:", error); 
      } finally {
          this.isLoading = false;
      }
  },
  

    // Add a new standar
    async addStandar(payload) {
      this.isSaving = true;

      const { data, statusCode } = await useApi("standars", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 200) {
        this.currentStandar = data.value.data;
      }

      return { res: statusCode.value === 200, item: this.currentStandar, statusCode: statusCode.value, data: data.value };
    },

    // Update an existing standar
    async updateStandar(payload) {
      this.isSaving = true;

      const { data, statusCode } = await useApi(`standars/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 200) {
        this.currentStandar = data.value.data;
      }

      return { res: statusCode.value === 200, item: this.currentStandar, statusCode: statusCode.value, data: data.value };
    },

    

    // const saveNewOrder = async (newOrder) => {
    //     try {
    //       const token = await getToken(); // Assume you have a token getter
    //       await axios.post(`${API_BASE_URL}/order`, { order: newOrder }, {
    //         headers: {
    //           'Authorization': `Bearer ${token}`,
    //           'Content-Type': 'application/json',
    //         },
    //       });
    //       // Optionally, refresh the data or handle success feedback here
    //     } catch (error) {
    //       console.error("Error updating order:", error);
    //       // Optionally, handle error feedback here
    //     }
    //   };

    // Delete a standar by ID
    async deleteStandar(id) {
      this.isDeleting = true;

      const { data } = await useApi(`standars/${id}`, {
        method: "DELETE",
      });
      this.isDeleting = false;

      if (data.value && data.value === "is deleted") {
        this.getStandars(); 
      }

      return data.value && data.value === "" ? true : false;
    },

    async exportStandars(payload) {
      const query = getQuery(this.filter, payload);
      this.isExporting = true;

      const { data, statusCode } = await useApi(`export-standard${query}`).blob();
      this.isExporting = false;

      if (statusCode.value === 200) {
        download(data.value, `standars.${payload.format}`, { type: "application/vnd.ms-excel" }).click();
      }
    },

    // async importStandard(payload) {
    //   this.isLoadingImportStandard = true;
    //   const formData = new FormData();
    
    //   formData.append('file', payload.file);
    
    //   // Replace map with forEach for native iteration
    //   payload.fields.forEach(el => {
    //     Object.keys(el).forEach(key => formData.append(key, el[key]));
    //   });
    
    //   try {
    //     const { data, statusCode } = await useApi(`import-standard`, {
    //       method: "POST",
    //       headers: { "Content-Type": null },
    //       body: formData,
    //     }).blob();

    
    //     if (statusCode.value !== 200) {
    //       // Download the error file
    //       download(data.value, `standard-error.xlsx`, { type: 'application/vnd.ms-excel' }).click();
    //       this.rowsError = 1;
    //       return { success: false, message: 'Import failed. Check the downloaded error file.' };
    //     }
    
    
    
    //     return { success: true, message: 'Import completed successfully!' };
    //   } catch (error) {
    //     console.error('Error during import:', error);
    //     return { success: false, message: 'An unexpected error occurred during import.' };
    //   } finally {
    //     this.isLoadingImportStandard = false;
    //   }
    // },

    async importStandard(payload) {
      this.isLoadingImportStandard = true;
      const formData = new FormData();
    
     
    
      formData.append('file', payload.file);
    
    
    
      payload.fields.forEach(el => {
        Object.keys(el).forEach(key => {
          formData.append(key, el[key]);
        });
      });
    
      try {
        const { data, statusCode } = await useApi(`import-standard`, {
          method: "POST",
          headers: { "Content-Type": null },
          body: formData,
        }).blob();
    
    
        if (statusCode.value !== 200) {
          return { success: false, message: 'Import failed. Check the downloaded error file.' };
        }
    
        return { success: true, message: 'Import completed successfully!' };
      } catch (error) {
        console.error('Error during import:', error);
        return { success: false, message: 'An unexpected error occurred during import.' };
      } finally {
        this.isLoadingImportStandard = false;
      }
    },
    
    
    // Send exported data via email
    async sendStandarExcelToMails(payload) {
      const query = getQuery(this.filter, payload);
      this.isSaving = true;

      const { statusCode } = await useApi(`send-excel-standars-mail${query}`);
      this.isSaving = false;

      return statusCode.value === 200;
    },
  },
});
