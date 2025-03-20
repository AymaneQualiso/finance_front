import { defineStore } from "pinia";

export const useInterCompanyStore = defineStore({
  id: "interCompanies",
  state: () => ({
    isSaving: false,
    isDeleting: false,
    isExporting: false,
    isLoadingSendingEmail: false,
    interCompaniesbalance: [],
    interCompanies: [],
    interCompaniesbalanceDetails: [],


    currentInterCompanybalance: {},
    
    total: 0,
    filter: {},
  }),
  actions: {
    // Fetch all interCompanies with optional filters
    async getAllInterCompanies(...payload) {
      this.isLoading = true;
      try {
        const queryString = getQuery({ per_page: 100 }, ...payload);
        const { data } = await useApi(`inter-companies${queryString}`);

        if (data.value) {
          this.interCompaniesbalanceDetails = data.value.data.map(item => item.details_balance || {});
          this.interCompaniesbalance = data.value.data.map(item => ({
            id: item.id,  // Store the intercompany ID
            balance: item.balance_sheet_head || {},
          }));
          this.interCompanies = data.value.data;
          this.total = data.value.total;
        }
      } catch (error) {
        console.error("Error fetching interCompanies:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch interCompanies with filters from the filter state
    async getInterCompanies(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;
    
      try {
        const { data } = await useApi(`inter-companies${query}`);
    
        if (data.value) {
          this.interCompaniesbalance = data.value.data.map(item => item.balance_sheet_head || {});
          this.interCompaniesbalanceDetails = data.value.data.map(item => item.details_balance || {});
          // this.interCompaniesbalance = data.value.data.map(item => ({
          //   id: item.id,  // Store the intercompany ID
          //   balance: item.balance_sheet_head || {},
          // }));
          
          

          this.interCompanies=data.value.data;

                    this.total = data.value.total;
    
          console.log("Fetched InterCompanies Data:",this.interCompanies);
          console.log("Fetched InterCompaniesbalance Data:",this.interCompaniesbalance);
          console.log("Fetched InterCompaniesbalanceDetails Data:",this.interCompaniesbalanceDetails);



          console.log("Total InterCompanies:", this.total);
        }
      } catch (error) {
        console.error("Error fetching interCompanies:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getInterCompaniesDetails(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;
    
      try {
        const { data } = await useApi(`intercompany/details${query}`);
    
        if (data.value) {
          // this.interCompaniesbalance = data.value.data.map(item => item.balance_sheet_head || {});
          this.interCompaniesbalanceDetails = data.value.data.map(item => item.details_balance || {});
          this.interCompaniesbalance = data.value.data.map(item => ({
            id: item.id,  // Store the intercompany ID
            balance: item.balance_sheet_head || {},
          }));
          this.currentInterCompanybalance =this.interCompaniesbalanceDetails = data.value.data.map(item => item.balance_sheet_head || {});

          
          

          this.interCompanies=data.value.data

                    this.total = data.value.total;
    
          console.log("Fetched InterCompanies Data:",this.interCompanies);
          console.log("Fetched InterCompaniesbalance Data:",this.interCompaniesbalance);
          console.log("Fetched InterCompaniesbalanceDetails Data:",this.interCompaniesbalanceDetails);
          console.log("Fetched InterCompaniesbalancecurrent Data:",this.currentInterCompanybalance);



          console.log("Total InterCompanies:", this.total);
        }
      } catch (error) {
        console.error("Error fetching interCompanies:", error);
      } finally {
        this.isLoading = false;
      }
    },
    
    

    // Fetch a single interCompany by ID
    async getInterCompany(id) {
      try {
        this.isLoading = true;
        console.log(`Fetching intercompany data with ID: ${id}`);
        
        const { data } = await useApi(`inter-companies/${id}`);
    
        if (data.value) {
          this.currentInterCompany = data.value;
    
          console.log("Fetched InterCompany Data:", this.currentInterCompany);
          console.log("Balance Sheet Head Data:", this.currentInterCompany.balance_sheet_head);
          console.log("Account:", this.currentInterCompany.account);
          console.log("Credit:", this.currentInterCompany.credit);
          console.log("Debit:", this.currentInterCompany.debit);
        } else {
          console.warn("No data returned for the provided ID.");
        }
      } catch (error) {
        console.error("Error fetching interCompany data:", error);
      } finally {
        this.isLoading = false;
        console.log("Finished fetching intercompany data.");
      }
    },
    

    // Add a new interCompany
    async addInterCompany(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi("inter-companies", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (statusCode.value === 201) {
          this.currentInterCompany = data.value.data;
        }

        return { res: statusCode.value === 201, item: this.currentInterCompany, statusCode: statusCode.value, data: data.value };
      } catch (error) {
        console.error("Error adding interCompany:", error);
      } finally {
        this.isSaving = false;
      }
    },

    // Update an existing interCompany
    async updateInterCompany(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`inter-companies/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (statusCode.value === 200) {
          this.currentInterCompany = data.value.data;
        }

        return { res: statusCode.value === 200, item: this.currentInterCompany, statusCode: statusCode.value, data: data.value };
      } catch (error) {
        console.error("Error updating interCompany:", error);
      } finally {
        this.isSaving = false;
      }
    },

    // Delete an interCompany by ID
    async deleteInterCompany(id) {
      this.isDeleting = true;
      try {
        const { data } = await useApi(`inter-companies/${id}`, {
          method: "DELETE",
        });

        if (data.value && data.value === "is deleted") {
          this.getInterCompanies();
        }

        return data.value && data.value === "" ? true : false;
      } catch (error) {
        console.error("Error deleting interCompany:", error);
        return false;
      } finally {
        this.isDeleting = false;
      }
    },

    // Reset interCompany to zero
    async resetToZero(id) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`inter-companies/reset-to-zero/${id}`);
        if (statusCode.value === 204) {
          this.getInterCompany(id);
        }
        return statusCode.value === 204;
      } catch (error) {
        console.error("Error resetting interCompany to zero:", error);
        return false;
      } finally {
        this.isSaving = false;
      }
    },

    // Total deletion of interCompany
    async totalDeletion(id) {
      this.isDeleting = true;
      try {
        const { data, statusCode } = await useApi(`inter-companies/total-deletion/${id}`);
        if (statusCode.value === 204) {
          this.currentInterCompany = {};
        }
        return statusCode.value === 204;
      } catch (error) {
        console.error("Error in total deletion:", error);
        return false;
      } finally {
        this.isDeleting = false;
      }
    },

    // Lock/unlock an interCompany
    async lockInterCompany(id, isLocked) {
      this.isSaving = true;
      try {
        const { statusCode } = await useApi(`inter-companies/lock-unlock/${id}`).post({ isLocked });
        return statusCode.value === 204;
      } catch (error) {
        console.error("Error locking/unlocking interCompany:", error);
        return false;
      } finally {
        this.isSaving = false;
      }
    },

    // Handle email sending
    async sendInterCompanyEmail(payload) {
      this.isLoadingSendingEmail = true;
      try {
        const { statusCode } = await useApi(`inter-companies/${payload.id}/send-email`).post(payload);
        return statusCode.value === 200;
      } catch (error) {
        console.error("Error sending email:", error);
        return false;
      } finally {
        this.isLoadingSendingEmail = false;
      }
    },

    // Validate interCompany
    async validateInterCompany(payload) {
      this.isSaving = true;
      console.log('pay',payload);
    
      try {
        const response = await useApi("interCompany-validate", {
          method: "POST",
          body: JSON.stringify({
            balance_id: payload.balanceId,
          }),
        });
    
        return response?.statusCode?.value === 200
          ? { success: true, message: "InterCompany validated successfully." }
          : { success: false, message: "Failed to validate InterCompany." };
    
      } catch (error) {
        console.error("Error validating interCompany:", error);
        return { success: false, message: "An unexpected error occurred." };
      } finally {
        this.isSaving = false;
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
              download(data.value, `InterSociete.${payload.format || 'xlsx'}`, {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              }).click();
            }
          } catch (error) {
            console.error('Error exporting intercompany details:', error);
          } finally {
            this.isExporting = false;
          }
        },

    
    reset(stateVar = "all") {
      if (stateVar == "all" || stateVar?.includes("interCompaniesbalance"))
          this.interCompaniesbalance = [];
      if (stateVar == "all" || stateVar?.includes("interCompaniesbalanceDetails"))
          this.interCompaniesbalanceDetails = [];
      if (stateVar == "all" || stateVar?.includes("total")) this.total = 0;
      if (stateVar == "all" || stateVar?.includes("filter")) this.filter = {};
      if (stateVar == "all" || stateVar?.includes("interCompanies"))
        this.interCompanies = [];
    }
  },
});
