export default [
    {
        path: "/settings/lockdown",
        name: "lockdown-parent",
        redirect: { name: "lockdown-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "lockdown-list",
                component: () => import('@/views/Settings/lockdown/index.vue'),
                meta: {
                    permission: 'lockdowns.index',
                    parent: "settings",
                },
            },

        ],
    },
]
