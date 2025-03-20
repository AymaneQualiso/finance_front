import { defineStore } from "pinia";

export const usePaymentdelayStore = defineStore({
  id: "paymentdelay",
  state: () => ({
    total: 0,
    filter: {},
    paymentdelays: [],
    natureOptions: [],
    isLoadingPaymentdelay: false,
  }),
  actions: {
    async getPaymentDelayspayload(...payload) {
      this.isLoadingPaymentdelay = true;
      if (payload) this.filter = Object.assign({}, this.filter, ...payload);
      let query = getQuery(this.filter);

      const { data, statusCode } = await useApi(`paymentdelays${query}`);
// console.log('data', data.value);

      this.paymentdelays = data.value.data;
      this.total = data.value.total;
      this.isLoadingPaymentdelay = false;

      return statusCode.value === 200;
    },
    async updateRecordspaymentdelays(...payload) {
      try {
        this.isLoadingPaymentdelay = true;
        const updateData = {
          statut: payload[0].statut,
          nature_obs_id: payload[0].nature_obs_id,
          observation: payload[0].observation,
          ids: payload[0].ids, 
        };
        
    
        // Call API to update the selected records
        const { data, statusCode } = await useApi('paymentdelays/update').post(updateData);

    
        if (statusCode.value === 200) {
          // Fetch the updated payment delays after successful update
          await this.getPaymentDelays();
    
          this.isLoadingPaymentdelay = false;
          return true;
        } else {
          console.error('Failed to update payment delays');
          
          return false;
        }
        
      } catch (error) {
        console.error('Error updating payment delays:', error);
        
        return false;
      }
    },
    
    async getPaymentDelays() {
      const { data, statusCode } = await useApi('paymentdelays').get();
      console.log('data', data.value);
      this.paymentdelays = data.value.data;
      this.total = data.value.total;
      return statusCode.value === 200;
    },
     async getNewPaymentDelays() {
      const { data, statusCode } = await useApi('paymentdelays/getNewPaymentDelays').get();
      console.log('data', data.value);
      this.paymentdelays = data.value.data;
      this.total = data.value.total;
      return statusCode.value === 200;
    },
     async getNatureObs() {
      const { data, statusCode } = await useApi('nature-obs').get();
      this.natureOptions = data.value;
      return statusCode.value === 200;
    },
    async exportList(ids) {
      this.isLoadingPaymentdelay = true
      this.filter = { ...this.filter, ...ids };

      let query = getQuery(this.filter);


      const { data, statusCode } = await useApi(`paymentdelays/export${query}`).blob();

      if(statusCode.value === 200) {
        download(data.value, `paymentdelay.xlsx`, { type: 'application/vnd.ms-excel' }).click()
      }

      this.isLoadingPaymentdelay = false
  },
  },
});
