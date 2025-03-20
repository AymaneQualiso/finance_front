export default [
    {
        path: "/inter",
        name: "inter-parent",
        redirect: { name: "inter-list" },
        // component: () => import('@/views/inter/index.vue'),
        children: [
            {
                path: "list",
                name: "inter-list",
                component: () => import('@/views/inter/list.vue'),
                meta: {
                    permission: 'inter.index',
                    parent: 'inter'
                },
            },
            {
                path: "edit/:id",
                name: "inter-edit",
                component: () => import('@/views/inter/edit.vue'),
                meta: {
                    permission: 'inter.update',
                    parent: 'inter'
                },
            },
        ],
    },
]
