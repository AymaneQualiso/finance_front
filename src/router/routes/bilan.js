export default [
    {
        path: "/bilan",
        name: "bilan-parent",
        redirect: { name: "bilan-list" },
        component: () => import('@/views/bilan/index.vue'),
        children: [
            {
                path: "list",
                name: "bilan-list",
                component: () => import('@/views/bilan/list.vue'),
                meta: {
                    permission: 'bilan.index',
                    parent: 'bilan'
                },
            },
            {
                path: "edit/:id",
                name: "bilan-edit",
                component: () => import('@/views/bilan/edit.vue'),
                meta: {
                    permission: 'bilan.update',
                    parent: 'bilan'
                },
            },
        ],
    },
]
