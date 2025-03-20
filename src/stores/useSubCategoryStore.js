import { defineStore } from 'pinia';

export const useSubCategoryStore = defineStore('subCategory', {
    state: () => ({
      SubCategories: [], 
      currentSubCategory: null,
      isLoading: false,
      isSaving: false,
      total: 0,
      filter: {},

    }),
    // other actions
  

  actions: {
    // Fetch all subcategories with optional filters and pagination
    async fetchSubALLCategories(...payload) {
      this.isLoading = true;

      try {
        const queryString = getQuery({ per_page: 10 }, ...payload);

        const { data } = await useApi(`sub-categories${queryString}`);

        if (data.value) {
          this.SubCategories = data.value.data;
          this.total = data.value.total;
        }
      } catch (error) {
        console.error("Error in fetchSubCategories:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch subcategories with applied filters
    async fetchSubCategories(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;

      try {
        const { data } = await useApi(`sub-categories${query}`);
        if (data.value ) {
          this.SubCategories = data.value.data;
          this.total = data.value.total;
        }
      } catch (error) {
        console.error("Error in getSubcate:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // async fetchStandardCategories(...payload) {
    //   if (payload) this.filter = Object.assign({}, this.filter, ...payload);
    //   const query = getQuery(this.filter);
    //   this.isLoading = true;

    //   const { data } = await useApi(`standard-categories${query}`);
    //   if (data.value) {
    //     this.standardCategories = data.value.data;
    //     this.total = data.value.total;
    //   }
    //   this.isLoading = false;
    // },


    // Fetch a single subcategory by ID
    async getSubCategory(id) {
      this.isLoading = true;
      try {
        const { data, statusCode } = await useApi(`sub-categories/${id}`);
        if (data.value) {
          this.currentSubCategory = data.value;
        }
      } catch (error) {
        console.error("Error in getSubCategory:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Create a new subcategory
    async addSubCategory(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`sub-categories`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (statusCode.value === 201 && data.value) {
          this.SubCategories.push(data.value);
          return true;
        }
      } catch (error) {
        console.error("Error in addSubCategory:", error);
      } finally {
        this.isSaving = false;
      }
      return false;
    },

    // Update an existing subcategory
    async updateSubCategory(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`sub-categories/${payload.id}`, {
          method: 'PUT',
          body: JSON.stringify({ label: payload.label , is_active: payload.is_active  }), // Only updating label
        });
        if (statusCode.value === 200 && data.value) {
          const index = this.SubCategories.findIndex(item => item.id === payload.id);
          if (index !== -1) {
            this.SubCategories[index] = data.value;
          }
          return true;
        }
      } catch (error) {
        console.error("Error in updateSubCategory:", error);
      } finally {
        this.isSaving = false;
      }
      return false;
    },

    // Delete a subcategory
    async deleteSubCategory(id) {
      this.isSaving = true;
      try {
        const { statusCode } = await useApi(`sub-categories/${id}`, {
          method: 'DELETE',
        });
        if (statusCode.value === 204) {
          this.SubCategories = this.SubCategories.filter(item => item.id !== id);
          return true;
        }
      } catch (error) {
        console.error("Error in deleteSubCategory:", error);
      } finally {
        this.isSaving = false;
      }
      return false;
    },

    // Update the order of subcategories (if applicable)
    async updateOrder(newOrder) {
      try {
        const { statusCode } = await useApi(`sub-categories/order`, {
          method: 'POST',
          body: JSON.stringify({ order: newOrder }),
        });
        return statusCode.value === 200;
      } catch (error) {
        console.error("Error in updateOrder:", error);
        return false;
      }
    },

    async exportsubcategory(payload) {
      const query = getQuery(this.filter, payload);
      this.isExporting = true;

      const { data, statusCode } = await useApi(`export-sub-category${query}`).blob();
      this.isExporting = false;

      if (statusCode.value === 200) {
        download(data.value, `sub_categories.${payload.format}`, { type: "application/vnd.ms-excel" }).click();
      }
    },

    // Update the order of standard categories
    async updateOrder(newOrder) {
      const { statusCode } = await useApi(`standard-categories/order`, {
        method: 'POST',
        body: JSON.stringify({ order: newOrder }),
      });

      return statusCode.value === 200;
    },
  },
});
