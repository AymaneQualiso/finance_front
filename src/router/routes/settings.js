export default [
    {
        path: "/general",
        name: "general-parent",
        redirect: { name: "settings-general" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "settings-general",
                component: () => import('@/views/Settings/general/index.vue'),
                meta: {
                    parent:"settings"
                }
            },
        ],
    },
]
