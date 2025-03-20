import { getQuery } from "@/@core/utils/helpers";
import { defineStore } from "pinia";
import { cloneDeep } from 'lodash'

export const useBalanceDetailsStore = defineStore({
  id: "balanceDetails",
  state: () => ({
    isSaving: false,
    isDeleting: false,
    isExporting: false,
    isLoading: false,
    isLoadingImport: false,
    balanceDetails: [],
    total: 0,
    filter: {},
    currentBalanceDetail: {},
    currentPage: 1  

  }),
  actions: {
    // Fetch all balance details with optional filters
    async getAllBalanceDetails(...payload) {
      this.isLoading = true;

      try {
        const queryString = getQuery({ per_page: 100 }, ...payload);

        const { data } = await useApi(`balance-details${queryString}`);

        if (data.value) {
          this.balanceDetails = data.value.data;
          this.total = data.value.total;
        }
      } catch (error) {
        console.error("Error in getAllBalanceDetails:", error);
      } finally {
        this.isLoading = false;
      }
    },

    
    async fetchRecords(params) {

      let query = getQuery(params)
      console.log("page in store before send api", params.page);
      
      const { data, statusCode } = await useApi(`balance-details${query}`).get()
  
      return { statusCode: statusCode.value, data: data }
    },

    async getBalanceDetails(...payload) {

      if (payload) {
        this.filter = Object.assign({}, this.filter, ...payload);
      }

      // const query = getQuery(this.filter);

      this.isLoading = true;

      try {
        // const { data } = await useApi(`balance-details${query}`);
        const { data } = await this.fetchRecords({ ...cloneDeep(this.filter), page: this.currentPage++ })

        if (data.value) {
          // this.balanceDetails = data.value.data;
          this.balanceDetails.push(...data.value.data)
          this.total = data.value.total;
        }
        
        return { data: data.value.data }
      } catch (error) {
        console.error("Error fetching balance details:", error);
      } finally {
        this.isLoading = false;
      }
    },


    // Fetch a single balance detail by ID
    async getBalanceDetail(id) {
      try {
        this.isLoading = true;

        const { data } = await useApi(`balance-details/${id}`);

        if (data.value) {
          this.currentBalanceDetail = data.value;
        }
      } catch (error) {
        console.error("Error fetching balance detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Add a new balance detail
    async addBalanceDetail(payload) {
      this.isSaving = true;

      const { data, statusCode } = await useApi("balance-details", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 200) {
        this.currentBalanceDetail = data.value.data;
      }

      return { res: statusCode.value === 200, item: this.currentBalanceDetail, statusCode: statusCode.value, data: data.value };
    },

    // Update an existing balance detail
    async updateBalanceDetail(payload) {
      this.isSaving = true;

      const { data, statusCode } = await useApi(`balance-details/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 200) {
        this.currentBalanceDetail = data.value.data;
      }

      return { res: statusCode.value === 200, item: this.currentBalanceDetail, statusCode: statusCode.value, data: data.value };
    },

    // Delete a balance detail by ID
    // async deleteBalanceDetail(id) {
    //   this.isDeleting = true;

    //   const { data } = await useApi(`balance-details/${id}`, {
    //     method: "DELETE",
    //   });
    //   this.isDeleting = false;

    //   if (data.value && data.value === "is deleted") {
    //     this.getBalanceDetails(); // Refresh list after deletion
    //   }

    //   return data.value && data.value === "" ? true : false;
    // },

    async deleteBalanceDetail(id) {
      try {
        this.isDeleting = true;
        console.log(`Starting deletion for BalanceDetail ID: ${id}`);
    
        const response = await useApi(`balance-details/${id}`, {
          method: "DELETE",
        });
    
        this.isDeleting = false;
    
        console.log("API Response:", response.statusCode);
    
        if (response && response.statusCode === 200) {
          console.log("Balance detail deleted successfully. Status:", response.status);
          return response.statusCode; 
        }
    
        console.warn("Failed to delete BalanceDetail. Status:", response ? response.status : "No response");
        return response ? response.statusCode : 500; // Return the status code or 500 for failure
      } catch (error) {
        this.isDeleting = false;
        console.error("Error during deletion:", error);
        return 500; // Return 500 as a fallback error status code
      }
    },
    
    

    // async exportBalanceDetails(payload) {
    //   const query = getQuery(this.filter, payload);
    //   this.isExporting = true;

    //   const { data, statusCode } = await useApi(`balance-details/export${query}`).blob();
    //   console.log('data',data);

    //   this.isExporting = false;

    //   if (statusCode.value === 200) {
    //     download(data.value, `balance-details.${payload.format}`, { type: "application/vnd.ms-excel" }).click();
    //   }
    // },

    // async exportIntersociete(payload)
    // {
    //   const query = getQuery(this.filter, payload);
    //   this.isExporting = true;

    //   const { data, statusCode } = await useApi(`inter-societe/export${query}`).blob();
    //   console.log('data',data);
    //   this.isExporting = false;

    //   if (statusCode.value === 200) {
    //     download(data.value, `balance-details.${payload.format}`, { type: "application/vnd.ms-excel" }).click();
    //   }
    // },
    async importInterCompany(payload) {
      this.isLoadingImport = true;
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("balance_id", payload.balance_id);

      payload.fields.forEach((el) => {
        Object.keys(el).forEach((key) => {
          formData.append(key, el[key]);
        });
      });

      try {
        const { data, statusCode } = await useApi("intercompany/import", {
          method: "POST",
          headers: { "Content-Type": null },
          body: formData,
        }).json();


        if (statusCode.value === 200) {
          return { success: true, message: data.value.message };
        }

        if (statusCode.value === 422) {
          return {
            success: false,
            message: data.value.errors,
            errors: data.value.errors,
          };
        }

        return { success: false, message: data.value.errors };
      } catch (error) {
        return { success: false, message: "An unexpected error occurred during import." };
      } finally {
        this.isLoadingImport = false;
      }
    },

    async importBalanceDetails(payload) {
      this.isLoadingImport = true;
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("balance_id", payload.balance_id);

      payload.fields.forEach((el) => {
        Object.keys(el).forEach((key) => {
          formData.append(key, el[key]);
        });
      });

      try {
        const { data, statusCode } = await useApi("balance-details/import", {
          method: "POST",
          headers: { "Content-Type": null },
          body: formData,
        }).json();


        if (statusCode.value === 200) {
          return { success: true, message: data.value.message };
        }

        if (statusCode.value === 422) {
          return {
            success: false,
            message: data.value.errors,
            errors: data.value.errors,
          };
        }

        return { success: false, message: data.value.errors };
      } catch (error) {
        return { success: false, message: "An unexpected error occurred during import." };
      } finally {
        this.isLoadingImport = false;
      }
    },


    async importBalanceDetailsProvision(payload) {
      this.isLoadingImport = true;
      const formData = new FormData();
      console.log("payload")
      console.log(payload.balance_id)
      formData.append("file", payload.file);
      formData.append("balance_id", payload.balance_id);
      formData.append("ProvisionId", payload.ProvisionId);
      console.log("formData 1")
      console.log(formData)

      payload.fields.forEach((el) => {
        Object.keys(el).forEach((key) => {
          formData.append(key, el[key]);
        });
      });
      console.log("formData 2")
      console.log(formData)

      try {
        const { data, statusCode } = await useApi("balance-details-provision/import", {
          method: "POST",
          headers: { "Content-Type": null },
          body: formData,
        }).json();


        if (statusCode.value === 200) {
          return { success: true, message: data.value.message };
        }

        if (statusCode.value === 422) {
          return {
            success: false,
            message: data.value.errors,
            errors: data.value.errors,
          };
        }

        return { success: false, message: data.value.errors };
      } catch (error) {
        return { success: false, message: "An unexpected error occurred during import." };
      } finally {
        this.isLoadingImport = false;
      }
    },

   

    async  exportBalanceDetails(payload) {
      this.isExporting = true;
    
      try {
        const query = getQuery(this.filter, payload);
    
        const { data, statusCode } = await useApi(`balance-details/export${query}`, {
          method: 'POST',
          responseType: 'blob', 
        }).blob();
    
        if (statusCode.value === 200) {
          download(data.value, `balance-details.${payload.format || 'xlsx'}`, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }).click();
        }
      } catch (error) {
        console.error('Error exporting balance details:', error);
      } finally {
        this.isExporting = false;
      }
    },

    async  exportInterCompanyDetails(payload) {
      this.isExporting = true;
    
      try {
        const query = getQuery(this.filter, payload);
    
        const { data, statusCode } = await useApi(`inter-societe-details/export${query}`, {
          method: 'POST',
          responseType: 'blob', 
        }).blob();
    
        if (statusCode.value === 200) {
          download(data.value, `balance-details.${payload.format || 'xlsx'}`, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }).click();
        }
      } catch (error) {
        console.error('Error exporting intercompany details:', error);
      } finally {
        this.isExporting = false;
      }
    },
    async  exportIntersociete(payload) {
      this.isExporting = true;
    
      try {
        const query = getQuery(this.filter, payload);
    
        const { data, statusCode } = await useApi(`inter-societe/export${query}`, {
          method: 'POST',
          responseType: 'blob', 
        }).blob();
    
        if (statusCode.value === 200) {
          download(data.value, `inter-societe.${payload.format || 'xlsx'}`, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }).click();
        }
      } catch (error) {
        console.error('Error exporting balance details:', error);
      } finally {
        this.isExporting = false;
      }
    },
    
    
  

    async addProvisionEntry(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi("provisions/create", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    
        this.isSaving = false;
    
        if (statusCode.value === 201 || statusCode.value === 200) {
          return { success: true, message: data.value.message, data: data.value.data };
        }
        return { 
          success: false, 
          message: data.value.error || "Une erreur est survenue.", 
          errors: data.value.error || null
                };
      } catch (error) {
        this.isSaving = false;
    
        if (error.response && error.response.data) {
          return { 
            success: false, 
            message: error.response.data.message || "Une erreur s'est produite.", 
            errors: error.response.data.errors || null 
          };
        }
    
        return { success: false, message: "Une erreur s'est produite lors de la création de la provision." };
      }
    },
    
    
    
    
    

    async sendBalanceDetailsExcelToMails(payload) {
      const query = getQuery(this.filter, payload);
      this.isSaving = true;

      const { statusCode } = await useApi(`balance-details/send-mail${query}`);
      this.isSaving = false;

      return statusCode.value === 200;
    },

    reset(stateVar = 'all') {
      if(stateVar == 'all' || stateVar?.includes('balanceDetails')) this.balanceDetails = []
      if(stateVar == 'all' || stateVar?.includes('currentPage')) this.currentPage = 1
      
      if(stateVar == 'all' || stateVar?.includes('total')) this.total = 0
      if(stateVar == 'all' || stateVar?.includes('filter')) this.filter = {}
      if(stateVar == 'all' || stateVar?.includes('isLoading')) this.isLoading = false
    }
  },
});
