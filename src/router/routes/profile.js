export default [
    {
        path: "/profile",
        name: "profile-parent",
        redirect: { name: "profile-list" },
        component: () => import('@/views/profile/index.vue'),
        children: [
            {
                path: "list",
                name: "profile-list",
                component: () => import('@/views/profile/list.vue'),
                meta: {
                    pageTitle: "Profil",
                },
            },
        ],
    },
]
