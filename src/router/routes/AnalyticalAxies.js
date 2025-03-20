export default [
    {
        path: "/settings/analytical_axies",
        name: "analytical-axies-parent",
        redirect: { name: "Analytical-axies-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "analytical-axies-list",
                component: () => import('@/views/settings/analyticalAxies/index.vue'),
                meta: {
                    parent: "settings",
                    permission: 'analytical_axies.index',
                    moduleName:'analytical-axies'
                },
            },
        ],
    },
] 
  