import { map } from "lodash";
import { defineStore } from "pinia";

export const useAccountsStore = defineStore({
    id: "accounts",
    state: () => ({
        isLoadingAccounts: false,
        isExportingAccounts: false,



        isLoadingImportAccounts: false,
        isLoadingChartAccountsCompany: false,
        accounts: [],
        chartAccountsCompanies: [],
        currentAccount: {},
        total: 0,
        filter: {},
        fieldsData: {
            'Libellé': 'label',
            'Libellé 2': 'label_2',
            'Status': 'is_active',
            'N° Compte': 'value',
            // 'Class compte 3': 'class_account3_id',
            // 'Société plan comptable': 'chart_accounts_companies_id'
            'Plan comptable': 'id_chart_account',
            'Type Compte Det': 'account_type_det',
        },
        requiredFieldsData: ['label', 'value', 'account_type_det'],
    }),
    actions: {
        async getAccounts(...payload) {
            if (payload) this.filter = Object.assign({}, this.filter, ...payload)
            let query = getQuery(this.filter)
            this.isLoadingAccounts = true

            const { data, statusCode } = await useApi(`accounts${query}`)

            this.accounts = data.value.data
            this.total = data.value.meta.total
            this.isLoadingAccounts = false

            return statusCode.value === 200
        },

        async getAccount(id) {
            this.isLoadingAccounts = true

            const { data, statusCode } = await useApi(`accounts/${id}`)

            if (statusCode.value === 200) {
                this.currentAccount = data.value
            }
            this.isLoadingAccounts = false
        },

        async createAccount(payload) {
            this.isLoadingAccounts = true;

            const formData = new FormData();
            map(payload, (el, key) => {
                formData.append(key, el)
            })

            const { statusCode, data } = await useApi("accounts", {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 201) {
                this.getAccounts()
            }

            this.isLoadingAccounts = false;

            return { statusCode: statusCode.value, data: data.value }
        },

        async updateAccount(payload) {
            this.isLoadingAccounts = true;

            const formData = new FormData();
            formData.append('_method', 'PUT')

            map(payload, (el, key) => {
                formData.append(key, el === null ? "" : el);
            });

            const { data, statusCode } = await useApi(`accounts/${payload.id}`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            })

            if (statusCode.value === 200) {
                this.getAccounts()
            }

            this.isLoadingAccounts = false;

            return { statusCode: statusCode.value, data: data.value }
        },

        async deleteAccount(payload) {
            this.isLoadingAccounts = true;

            const { statusCode } = await useApi(`accounts/${payload}`).delete();

            if (statusCode.value === 200) {
                this.getAccounts()
            }

            this.isLoadingAccounts = true;

            return statusCode.value === 200
        },
        async importAccounts(payload) {
            this.isLoadingImportAccounts = true
            const formData = new FormData()

            formData.append('file', payload.file)
            map(payload.fields, el => {
                Object.keys(el).map(key => formData.append(key, el[key]))
            })

            const { data, statusCode } = await useApi(`accounts/import`, {
                method: "POST",
                headers: { "Content-Type": null },
                body: formData,
            }).blob()

            if (statusCode.value != 201) {
                download(data.value, `comptes-error.xlsx`, { type: 'application/vnd.ms-excel' }).click()
                this.rowsError = 1
            }

            this.getAccounts()

            this.isLoadingImportAccounts = false

            return statusCode.value === 201
        },
        async exportList(ids) {
            this.filter = { ...this.filter, ...ids };

            let query = getQuery(this.filter);

            this.isExportingAccounts = true

            const { data, statusCode } = await useApi(`accounts/export${query}`).blob();

            if (statusCode.value === 200) {
                download(data.value, `Compte.xlsx`, { type: 'application/vnd.ms-excel' }).click()
            }

            this.isExportingAccounts = false
        },
        async getOnlyIdLabelChartAccountsCompanies() {
            this.isLoadingChartAccountsCompany = true

            const { data, statusCode } = await useApi(`accounts/getOnlyIdLabelChartAccountsCompanies`)

            this.chartAccountsCompanies = data.value
            this.isLoadingChartAccountsCompany = false

            return statusCode.value === 200
        },
    },
})
