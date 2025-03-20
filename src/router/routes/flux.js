export default [
    {
        path: "/flux",
        name: "flux-parent",
        redirect: { name: "flux-list" },
        component: () => import('@/views/flux/index.vue'),
        children: [
            {
                path: "list",
                name: "flux-list",
                component: () => import('@/views/flux/list.vue'),
                meta: {
                    permission: 'flux.index',
                    parent: 'flux'
                },
            },
            {
                path: "edit/:id",
                name: "flux-edit",
                component: () => import('@/views/flux/edit.vue'),
                meta: {
                    permission: 'flux.update',
                    parent: 'flux'
                },
            },
        ],
    },
]
