export default [
    {
        path: "/settings/account-types-det",
        name: "account-types-det-parent",
        redirect: { name: "account-types-det-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "account-types-det-list",
                component: () => import('@/views/Settings/accountTypesDet/index.vue'),
                meta: {
                    parent: "settings",
                    permission: 'account_type_dets.index',
                    moduleName:'account-types-det'
                },
            },
            // {
            //     path: "create",
            //     name: "account-types-det-create",
            //     component: () => import('@/views/Settings/account-types-det/FormAction.vue'),
            //     meta: {
            //         permission: 'account_types_det.store',
            //     },
            // },
            // {
            //     path: ":id/edit",
            //     name: "account-types-det-update",
            //     props: true,
            //     component: () => import('@/views/Settings/account-types-det/FormAction.vue'),
            //     meta: {
            //         permission: 'account_types_det.update',
            //     },
            // },
            // {
            //     path: ":id",
            //     name: "account-types-det-show",
            //     props: true,
            //     component: () => import('@/views/Settings/account-types-det/FormAction.vue'),
            //     meta: {
            //         permission: 'account_types_det.show',
            //     },
            // },
        ],
    },
]
