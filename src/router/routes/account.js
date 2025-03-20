export default [
    {
        path: "/settings/accounts",
        name: "accounts-parent",
        redirect: { name: "accounts-list" },
        // component: () => import('@/pages/settings.vue'),
        component: () => import('@/views/accounts/index.vue'),
        children: [
            {
                path: "list",
                name: "accounts-list",
                component: () => import('@/views/accounts/list.vue'),
                meta: {
                    permission: 'accounts.index',
                    moduleName: 'Accounts'
                },
            },
        ],
    },
] 
