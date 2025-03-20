import { defineStore } from "pinia";

export const useExerciceStore = defineStore({
    id: "exercice",
    state: () => ({
        isLoadingExercices: false,
        exercices: [],
        total: 0,
        filter: {},
    }),
    actions: {
        async getExercicesIdYear() {
            this.isLoadingExercices = true

            const { data, statusCode } = await useApi(`exercices/getOpenExercices`)

            if (statusCode.value = 200) {        
                this.exercices = data.value
            }
            
            this.isLoadingExercices = false
        },

        async checkExistingExerciceInBalance(payload) {
            this.isLoadingExercices = true

            const { data, statusCode } = await useApi(`exercices/${payload}/checkExistingExerciceInBalance`)
            
            this.isLoadingExercices = false
            return { data: data.value, statusCode: statusCode.value}
        },

        async getExerciceN1(payload) {
            this.isLoadingExercices = true
            const { data, statusCode } = await useApi(`exercices/${payload}/getExerciceN1`)

            this.isLoadingExercices = false
            return { data: data.value, statusCode: statusCode.value}
        },
    },
})
