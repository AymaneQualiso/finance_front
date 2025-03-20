import { isEmpty } from "@/@core/utils/helpers";
import { useCompanyStore, useCompanyGroupStore, useUserStore, useCoreStore } from "@/stores";
import { useRouter } from "vue-router";
export function useCompany(t = e => e, showSnackbar) {
    const companyStore = useCompanyStore();
    const { companies, isCompaniesLoading, total, page, filters, company, isExportingCompanies, isCompanyLoading } = storeToRefs(companyStore);
    const companyGroup = useCompanyGroupStore();
    const { companyGroups, isCompanyGroupLoading } = storeToRefs(companyGroup);
    const userStore = useUserStore();
    const coreStore = useCoreStore();
    const { enums } = storeToRefs(coreStore);
    const router = useRouter();
    const route = useRoute()
    const users = ref([]);
    const refForm = ref(null);
    const rememberId = ref(null)
    const isLoadingDeleteCompany = ref([])
    const isDialogVisible = ref(false);
    const selected = ref([])
    const isLoad = ref(false)
    const headers = ref([
        {
            title: t("label"),
            sortable: true,
            key: "label",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("abv"),
            sortable: true,
            key: "abv",
            filtervalue: "",
            filterable: true,
            typefilter: "text",
        },
        {
            title: t("is_active"),
            sortable: true,
            key: "is_active",
            filtervalue: "",
            filterable: true,
            typefilter: "select",
            itemKey: "key",
            itemTitle: "title",
            selectvalue: getEnums(enums.value.isActive, t),
        },
        {
            title: t("users"),
            sortable: false,
            key: "users",
        },
        {
            title: "",
            sortable: false,
            key: "actions",
        },
    ]);

    function changeFilter(...obj) {
        companyStore.getDTCompanies(...obj);
    }

    function redirectToForm(module, action, item = null, query = null) {
        const to = { name: `${module}-${action}`, query }

        if (item) {
            to.params = { id: item.id }
            const userIds = item.users.map(user => user.id);
            company.value = { ...item, usersIds: userIds }
        }
        router.push(to)
    }

    function onFormSubmit() {
        refForm.value.validate().then(async ({ valid }) => {
            if (!valid) return;
            company.value.label = capitalizeFirstLetter(company.value.label);
            const { statusCode, data } = company.value?.id
                ? await companyStore.updateCompany(company.value)
                : await companyStore.addCompany(company.value);
            if (statusCode == 201) {
                showSnackbar(t("Added ok", { model: t("company.company") }), { color: "success" });
                redirectToForm("companies", "list", null, null)
            } else if (statusCode == 200) {
                showSnackbar(t("Updated ok", { model: t("company.company") }), { color: "success" });
                redirectToForm("companies", "list", null, null)
            } else if (statusCode === 422) {
                if (data.errors && Object.keys(data.errors).length > 0) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    const firstErrorMessage = data.errors[firstErrorKey][0];

                    showSnackbar(t(firstErrorMessage), { color: "error" });
                } else {
                    showSnackbar(t(data.message), { color: "error" });
                }
            } else if (statusCode == 400) {
                showSnackbar(t(data.message), {
                  color: "error",
                });
            } else {
                showSnackbar(t("try again in a few seconds"), { color: "error" });
            }
        })
    }

    function openModalDelete(item) {
        company.value.id = item.id;
        isDialogVisible.value = true;
        rememberId.value = item.id
    }

    function closeModalDelete() {
        isDialogVisible.value = false;
        // isDialogAddVisible.value = false;
        rememberId.value = null;
    }

    async function deleteCompany() {
        isLoadingDeleteCompany.value[rememberId.value] = true
        const { statusCode, data } = await companyStore.deleteCompany(
            company.value?.id
        );
        if (statusCode === 200) {
            closeModalDelete();
            showSnackbar(t("Deleted ok", { model: t("company.company") }), { color: "success" });
        } else if (statusCode === 409) {
            isLoadingDeleteCompany.value[rememberId.value] = false
            closeModalDelete();
            showSnackbar(t(data.message), { color: "warning" });
        } else {
            showSnackbar(t("try again in a few seconds"), { color: "error" });
        }
        isLoadingDeleteCompany.value[rememberId.value] = false
    }

    async function exportExcel() {
        await companyStore.exportList({ ids: selected.value })
    }

    async function getData() {
        isLoad.value = true
        if (route.params.id) {
            if (!company.value.id) {
                await companyStore.getCompany(route.params.id)
            }
            // const userIds = company.value.users.map(user => user.id);
            // company.value = { ...company.value, usersIds: userIds}

            company.value.usersIds = company.value.users.map(user => user.id);
        } else {
            company.value = {}
            company.value.is_active = enums.value.isActive.ACTIVE;
        }
        if (isEmpty(companyGroups.value)) {
            companyGroup.getAllCompanyGroups()
        }
        users.value = await userStore.getAllUsers()
        isLoad.value = false
    }

    return {
        isLoad,
        router,
        companyStore,
        companies,
        isCompaniesLoading,
        isCompanyLoading,
        company,
        users,
        coreStore,
        enums,
        companyGroups,
        refForm,
        headers,
        rememberId,
        isLoadingDeleteCompany,
        isDialogVisible,
        selected,
        isExportingCompanies,
        redirectToForm,
        onFormSubmit,
        changeFilter,
        openModalDelete,
        closeModalDelete,
        deleteCompany,
        exportExcel,
        getData
    }
}
