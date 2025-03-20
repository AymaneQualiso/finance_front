import { getQuery } from "@/@core/utils/helpers";
import { defineStore } from "pinia";

export const useBlanceStore = defineStore({
  id: "balances",
  state: () => ({

    isSaving: false,
    isDeleting: false,
    isExporting: false,
    isLoadingSendingEmail: false,
    balances: [],
    cpcEntetes: [],
    total: 0,
    filter: {},
    currentBalance: {},
    usersAllowedToReOpenBalance: [],
  }),
  actions: {
    async getAllBalances(...payload) {
      this.isLoading = true;

      try {
        const queryString = getQuery({ per_page: 100 }, ...payload);

        const { data } = await useApi(`balance${queryString}`);

        if (data.value) {
          this.balances = data.value.data;
          this.total = data.value.total;

        }
      } catch (error) {
      } finally {
        this.isLoading = false;
      }
    },

    // async getAllowedUsersToReOpenBalance(id) {
    //   this.isLoading = true;

    //   try {
    //     const { data } = await useApi(`users-allowed-to-repopen-balance/${id}`);

    //     if (data.value) {
    //       this.usersAllowedToReOpenBalance = data.value;
    //     }
    //   } catch (error) {
    //   }
    // },

    async reOpenBalance(id) {
      this.isSaving = true;

      try {
        const { data, statusCode } = await useApi(`balance/reopen/${id}`);

        if (statusCode.value === 200) {
          this.currentBalance = data.value.data;
        }

        return { res: statusCode.value === 200, item: this.currentBalance, statusCode: statusCode.value, data: data.value };
      } catch (error) {
        console.error("Error in reOpenBalance:", error);
        return { res: false, item: this.currentBalance, statusCode: 500, data: {} };
      } finally {
        this.isSaving = false;
      }
    },
    async getBlances(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;

      const { data } = await useApi(`balance${query}`);
      if (data.value) {
        this.balances = data.value.data;
        this.total = data.value.total;
      }
      this.isLoading = false;
    },




    async getBlance(id) {
      try {
        this.isLoading = true;

        const { data } = await useApi(`balance/${id}`);

        if (data.value) {
          this.currentBalance = data.value;
          this.cpcEntetes = data.value.cpc_entetes;
        } else {
        }
      } catch (error) {
        console.error("Error fetching standard data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // create CPC item
    async createCpcEntete(balanceSheetHeadId, payload) {
      this.isLoading = true;

      try {
        const { data, statusCode } = await useApi(`balance-details/create-cpc/${balanceSheetHeadId}`).post(payload);

        if (data.value) {
          this.cpcEntetes = data.value.cpcEntetes;
          return statusCode.value == 201;
        }
      } catch (error) {
        console.error("Error creating CPC item:", error);
      } finally {
        this.isLoading = false;
      }
    },


    // Add a new standar
    async addBlance(payload) {
      this.isSaving = true;

      const { data, statusCode } = await useApi("balance", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 201) {
        this.currentBalance = data.value.data;
      }

      return { res: statusCode.value === 201, item: this.currentBalance, statusCode: statusCode.value, data: data.value };
    },

    async updateBalance(payload) {
      this.isSaving = true;

      const { data, statusCode } = await useApi(`balance/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 200) {
        this.currentBalance = data.value.data;
      }

      return { res: statusCode.value === 200, item: this.currentBalance, statusCode: statusCode.value, data: data.value };
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
    async deleteBalance(id) {
      this.isDeleting = true;

      const { data } = await useApi(`balance/${id}`, {
        method: "DELETE",
      });
      this.isDeleting = false;

      if (data.value && data.value === "is deleted") {
        this.getStandars(); // Refresh list after deletion
      }

      return data.value && data.value === "" ? true : false;
    },

    async deleteProvisions(id) {
      this.isDeleting = true;

      const { data, statusCode } = await useApi(`balance/delete-provisions/${id}`);
      this.isDeleting = false;

      if (statusCode.value === 204) {
        this.getBlance(id);
      }

      return statusCode.value === 204;
    },
    async resetToZero(id) {
      this.isSaving = true;

      const { data, statusCode } = await useApi(`balance/reset-to-zero/${id}`);
      this.isSaving = false;

      if (statusCode.value === 204) {
        this.getBlance(id);
      }

      return statusCode.value === 204;
    },
    async totalDeletion(id) {
      this.isDeleting = true;

      const { data, statusCode } = await useApi(`balance/total-deletion/${id}`);
      this.isDeleting = false;

      if (statusCode.value === 204) {
        // this.getBlance(id);
        this.currentBalance = {}
      }

      return statusCode.value === 204;
    },
    async lockBalance(id, isLocked) {
      this.isSaving = true;

      const { data, statusCode } = await useApi(`balance/lock-unlock/${id}`).post({ isLocked });
      this.isSaving = false;

      return statusCode.value === 204;
    },



    async handleProvisionTermine(payload) {
      this.isSaving = true
      try {
        const { data, statusCode } = await useApi(`balance/Termine`, {
          method: "POST",
          body: JSON.stringify({ balance_id: payload.balanceId }),
        });
        console.log('data', data.value.message);

        if (statusCode.value === 200) {
          return { success: true, message: "Provision terminated successfully." };
        } else {
          return { success: false, message: data.value.message };
        }
      } catch (error) {
        return { success: false, message: data.value.message };
      } finally {
        this.isSaving = false;
      }
    },


    async handleValidateBalancess(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`balance/Validate`, {
          method: "POST",
          body: JSON.stringify({
            balance_id: payload.balanceId,
            comment: payload.comment,
            action: payload.action,
          }),
        });

        if (statusCode.value === 200) {
          return { success: true, message: "Balance validated successfully." };
        } else {
          return { success: false, message: "Failed to validate balance." };
        }
      } catch (error) {
        console.error("Error in handleValidateBalancess:", error);
        return { success: false, message: "An unexpected error occurred." };
      } finally {
        this.isSaving = false;
      }
    },
    async handleValidateInterCompany(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`balance/Validate`, {
          method: "POST",
          body: JSON.stringify({
            balance_id: payload.balanceId,
            comment: payload.comment,
            action: payload.action,
          }),
        });

        if (statusCode.value === 200) {
          return { success: true, message: "Balance validated successfully." };
        } else {
          return { success: false, message: "Failed to validate balance." };
        }
      } catch (error) {
        console.error("Error in handleValidateBalancess:", error);
        return { success: false, message: "An unexpected error occurred." };
      } finally {
        this.isSaving = false;
      }
    },

    async deleteInterCompanies(id) {
      this.isDeleting = true;

      const { data, statusCode } = await useApi(`balance/delete-inter-companies/${id}`);
      this.isDeleting = false;

      if (statusCode.value === 204) {
        this.getBlance(id);
      }


      return statusCode.value === 204;
    },







    // Export standards data


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

    async sendingMail(payload) {
      this.isLoadingSendingEmail = true
      const { statusCode } = await useApi(`balance/${payload.id}/sendingEmail`).post(payload)
      this.isLoadingSendingEmail = false

      return statusCode.value === 200
    }



  },
});
