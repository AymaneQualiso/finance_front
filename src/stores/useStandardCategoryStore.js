import { defineStore } from 'pinia';

export const useStandardCategoryStore = defineStore('standardCategory', {
  state: () => ({
    standardCategories: [],
    currentStandardCategory: null,
    isLoading: false,
    isSaving: false,
    total: 0,
    filter: {},

  }),

  getters: {
    // Getter to return the total number of subcategories
    CategoryCount: (state) => state.total || state.standardCategories.length,
  },


  actions: {
 

    async fetchStandardallCategories(...payload) {
        this.isLoading = true;
      
        try {
          const queryString = getQuery({ per_page: 10 }, ...payload);
      
          const { data } = await useApi(`standard-categories${queryString}`);
      
          if (data.value) {
            this.standardCategories = data.value.data;
            this.total = data.value.total;
           
          }
        } catch (error) {
          console.error("Error in  cate getAllStandars:", error);
        } finally {
          this.isLoading = false;
        }
      },

      

    // Fetch standars with filters from the filter state
    async fetchStandardCategories(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;

      const { data } = await useApi(`standard-categories${query}`);
      if (data.value) {
        this.standardCategories = data.value.data;
        this.total = data.value.total;
      }
      this.isLoading = false;
    },


    // Fetch a single standard category by ID
    async getStandardCategory(id) {
      this.isLoading = true;
      const { data, statusCode } = await useApi(`standard-categories/${id}`);
      if (statusCode.value === 200 && data.value) {
        this.currentStandardCategory = data.value;
      }
      this.isLoading = false;
    },

    // Create a new standard category
    async addStandardCategory(payload) {
      this.isSaving = true;
      const { data, statusCode } = await useApi(`standard-categories`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.isSaving = false;

      if (statusCode.value === 201 && data.value) {
        this.standardCategories.push(data.value);
        return true;
      }
      return false;
    },

    // Update an existing standard category
    async updateStandardCategory(payload) {
      this.isSaving = true;
      const { data, statusCode } = await useApi(`standard-categories/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify({ label: payload.label,is_active: payload.is_active  }), // Only updating label
      });
      this.isSaving = false;

      if (statusCode.value === 200 && data.value) {
        const index = this.standardCategories.findIndex(item => item.id === payload.id);
        if (index !== -1) {
          this.standardCategories[index] = data.value;
        }
        return true;
      }
      return false;
    },
    
    

    // Delete a standard category
    async deleteStandardCategory(id) {
      this.isSaving = true;
      const { statusCode } = await useApi(`standard-categories/${id}`, {
        method: 'DELETE',
      });
      this.isSaving = false;

      if (statusCode.value === 204) {
        this.standardCategories = this.standardCategories.filter(item => item.id !== id);
        return true;
      }
      return false;
    },

    async exportcategory(payload) {
      this.filter = { ...this.filter, ...payload };
      const query = getQuery(this.filter);
      this.isExporting = true;

      const { data, statusCode } = await useApi(`export-standard-category${query}`).blob();
      this.isExporting = false;

      if (statusCode.value === 200) {
        download(data.value, `standard_categories.${payload.format}`, { type: "application/vnd.ms-excel" }).click();
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
