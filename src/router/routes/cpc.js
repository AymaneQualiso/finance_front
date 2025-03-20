export default [
    {
        path: "/settings/cpc",
        name: "cpc-parent",
        redirect: { name: "cpc-list" },
        component: () => import('@/views/cpc/index.vue'),
        children: [
            {
                path: "list",
                name: "cpc-list",
                component: () => import('@/views/cpc/list.vue'),
                meta: {
                    permission: 'cpc.index',
                    parent: 'cpc'
                },
            },
            {
                path: "edit/:id",
                name: "cpc-edit",
                component: () => import('@/views/cpc/edit.vue'),
                meta: {
                    permission: 'cpc.update',
                    parent: 'cpc'
                },
            },
        ],
    },
]
