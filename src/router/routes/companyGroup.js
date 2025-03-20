export default [
    {
        path: "/settings/company-groups",
        name: "company-group-parent",
        redirect: { name: "company-group-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "company-group-list",
                component: () => import('@/views/settings/companyGroups/index.vue'),
                meta: {
                    permission: 'company_groups.index',
                    parent: "settings",
                    moduleName:'company-groups'
                },
            },

        ],
    },
] 
  