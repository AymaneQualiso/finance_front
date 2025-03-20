export default [
    {
        path: "/settings/groups",
        name: "group-parent",
        redirect: { name: "group-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "group-list",
                component: () => import('@/views/Settings/groups/index.vue'),
                meta: {
                    permission: 'groups.index',
                    parent: "settings",
                },
            },

        ],
    },
]
