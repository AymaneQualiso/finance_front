import { defineStore } from 'pinia';

export const useSectionStore = defineStore('Section', {
    state: () => ({
      Sections: [], 
      currentSection: null,
      isLoading: false,
      isSaving: false,
      total: 0,
      filter: {},
    }),
  
  

  actions: {
    async fetchALLSections(...payload) {
      this.isLoading = true;

      try {
        const queryString = getQuery({ per_page: 10 }, ...payload);

        const { data } = await useApi(`section${queryString}`);

        if (data.value) {
          this.Sections = data.value.data;
          this.total = data.value.total;
        }
      } catch (error) {
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch subcategories with applied filters
    async fetchSections(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;

      try {
        const { data } = await useApi(`section${query}`);
        if (data.value ) {
          this.Sections = data.value.data;
          this.total = data.value.total;
        }
      } catch (error) {
        console.error("Error in getSubcate:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getSection(id) {
      this.isLoading = true;
      try {
        const { data, statusCode } = await useApi(`sub-categories/${id}`);
        if (statusCode.value === 200 && data.value) {
          this.currentSection = data.value;
        }
      } catch (error) {
        console.error("Error in getSubCategory:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addSection(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`section`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (statusCode.value === 201 && data.value) {
          this.Sections.push(data.value);
          return true;
        }
      } catch (error) {
        console.error("Error in addSubCategory:", error);
      } finally {
        this.isSaving = false;
      }
      return false;
    },

    async updateSection(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`section/${payload.id}`, {
          method: 'PUT',
          body: JSON.stringify({ label: payload.label , is_active: payload.is_active }), // Only updating label
        });
        if (statusCode.value === 200 && data.value) {
          const index = this.Sections.findIndex(item => item.id === payload.id);
          if (index !== -1) {
            this.Sections[index] = data.value;
          }
          return true;
        }
      } catch (error) {
        console.error("Error in update sexction:", error);
      } finally {
        this.isSaving = false;
      }
      return false;
    },

    async exportsections(payload) {
      const query = getQuery(this.filter, payload);
      this.isExporting = true;
  
      const { data, statusCode } = await useApi(`export-section${query}`).blob();
      this.isExporting = false;
  
      if (statusCode.value === 200) {
        download(data.value, `sections.${payload.format}`, { type: "application/vnd.ms-excel" }).click();
      }
    },

    async deleteSection(id) {
      this.isSaving = true;
      try {
        const { statusCode } = await useApi(`section/${id}`, {
          method: 'DELETE',
        });
        if (statusCode.value === 204) {
          this.Sections = this.Sections.filter(item => item.id !== id);
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
  
  },





});
