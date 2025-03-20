export default [
    {
        path: "/bg-consolide",
        name: "bg-consolide-parent",
        redirect: { name: "bg-consolide-list" },
        component: () => import('@/views/bg_consolide/index.vue'),
        children: [
            {
                path: "list",
                name: "bg-consolide-list",
                component: () => import('@/views/bg_consolide/list.vue'),
                meta: {
                    permission: 'bg_consolides.index',
                    parent: "bg-consolide-list"
                },
            },
            {
                path: "details/:id?",
                name: "bg-consolide-details",
                component: () => import('@/views/balanceDetails/list.vue'),
                meta: { 
                    permission: 'bg_consolides.update',
                    parent: "bg-consolide-list"
                 },
            },
        ],
    },
]
