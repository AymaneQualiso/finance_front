export default [
    {
        path: "/settings/companies",
        name: "companies-parent",
        redirect: { name: "companies-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "companies-list",
                component: () => import('@/views/settings/companies/index.vue'),
                meta: {
                    parent: "settings",                   
                    permission: 'companies.index',
                },
            },
            {
                path: "create",
                name: "companies-create",
                component: () => import('@/views/settings/companies/FormAction.vue'),
                meta: {
                    permission: 'companies.store',
                    parent: "settings",                   
                },
            },
            {
                path: ":id/edit",
                name: "companies-update",
                props: true,
                component: () => import('@/views/settings/companies/FormAction.vue'),
                meta: {
                    permission: 'companies.update',
                    parent: "settings",                   
                },
            },
            {
                path: ":id",
                name: "companies-show",
                props: true,
                component: () => import('@/views/settings/companies/FormAction.vue'),
                meta: {
                    permission: 'companies.show',
                    parent: "settings",                   
                },
            },
        ],
    },
  ] 
  