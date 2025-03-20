import { defineStore } from "pinia";

export const useExerciceStore = defineStore({
  id: "exercices",
  state: () => ({
    isLoading: false,
    isSaving: false,
    isDeleting: false,
    isExporting: false,
    exercices: [],
    total: 0,
    filter: {},
    currentExercice: {},
  }),
  actions: {
    // Fetch all exercices with optional filters
    async getAllExercices(...payload) {
      this.isLoading = true;
      try {
        const queryString = getQuery({ per_page: 100 }, ...payload);
        const { data } = await useApi(`exercices${queryString}`);

        if (data.value) {
          this.exercices = data.value.data;
          this.total = data.value.meta.total;
        }
      } catch (error) {
        console.error("Error in getAllExercices:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch filtered exercices based on the filter state
    async getExercices(...payload) {
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      const query = getQuery(this.filter);
      this.isLoading = true;

      try {
        const { data } = await useApi(`exercices${query}`);
        if (data.value) {
          this.exercices = data.value.data;
          this.total = data.value.meta.total;
        }
      } catch (error) {
        console.error("Error fetching exercices:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch a single exercice by ID
    async getExercice(id) {
      this.isLoading = true;
      try {
        const { data } = await useApi(`exercices/${id}`);
        if (data.value) {
          this.currentExercice = data.value;
        }
      } catch (error) {
        console.error("Error fetching exercice:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async addExercice(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi("exercices", {
          method: "POST",
          body: JSON.stringify(payload),
        });
    
        if (statusCode.value === 200) {
          this.currentExercice = data.value;
          return {
            success: true,
            message: "Exercice ajouté avec succès.",
            data: this.currentExercice,
          };
        } else {
          return {
            success: false,
            message: data.value?.message || "Failed to add exercice.",

          };

          
        }

      } catch (error) {
        console.error("Error adding exercice:", error);
        return {
          success: false,
          message: error.response?.data?.message || "An unexpected error occurred.",
        };
      } finally {
        this.isSaving = false;
      }
    },
    

    // Update an existing exercice
    async updateExercice(payload) {
      this.isSaving = true;
      try {
        const { data, statusCode } = await useApi(`exercices/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (statusCode.value === 200) {
          this.currentExercice = data.value;
        }
        return { success: statusCode.value === 200, data: this.currentExercice };
      } catch (error) {
        console.error("Error updating exercice:", error);
        return { success: false };
      } finally {
        this.isSaving = false;
      }
    },

    // Delete an exercice by ID
    async deleteExercice(id) {
      this.isDeleting = true;
      try {
        const { data } = await useApi(`exercices/${id}`, { method: "DELETE" });

        if (data.value === "is deleted") {
          await this.getExercices();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error deleting exercice:", error);
        return false;
      } finally {
        this.isDeleting = false;
      }
    },

    // Import exercices
    async importExercices(payload) {
      this.isLoading = true;
      const formData = new FormData();

      formData.append("file", payload.file);

      try {
        const { data, statusCode } = await useApi(`import-exercices`, {
          method: "POST",
          headers: { "Content-Type": null },
          body: formData,
        }).blob();

        if (statusCode.value !== 200) {
          console.error("Import failed");
          return { success: false };
        }
        return { success: true, data: data.value };
      } catch (error) {
        console.error("Error during import:", error);
        return { success: false };
      } finally {
        this.isLoading = false;
      }
    },

    async clotureExercise(id, status) {
        this.isSaving = true;
        try {
          const { data, statusCode } = await useApi(`exercices/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
          });
  
          if (statusCode.value === 200) {
            const updatedExercise = this.exercices.find((exercise) => exercise.id === id);
            if (updatedExercise) {
              updatedExercise.status = status; // Update status locally
            }
            return { success: true, data: data.value };
          } else {
            console.error("Failed to update status");
            return { success: false };
          }
        } catch (error) {
          console.error("Error during clotureExercise:", error);
          return { success: false };
        } finally {
          this.isSaving = false;
        }
      },

    // Export exercices
    async exportExercices(payload) {
      this.isExporting = true;
      const query = getQuery(this.filter, payload);

      try {
        const { data, statusCode } = await useApi(`export-exercices${query}`).blob();

        if (statusCode.value === 200) {
          download(data.value, `exercices.${payload.format}`, {
            type: "application/vnd.ms-excel",
          }).click();
        }
      } catch (error) {
        console.error("Error exporting exercices:", error);
      } finally {
        this.isExporting = false;
      }
    },
  },
});
