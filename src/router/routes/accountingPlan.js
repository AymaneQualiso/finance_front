export default [
    {
        path: "/settings/accounting-plan",
        name: "accounting-plan-parent",
        redirect: { name: "accounting-plan-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "accounting-plan-list",
                component: () => import('@/views/Settings/accountingPlans/index.vue'),
                meta: {
                    parent: "settings",
                    permission: 'chart_accounts.index',
                },
            },
            {
                path: "create",
                name: "accounting-plan-create",
                component: () => import('@/views/Settings/accountingPlans/FormAction.vue'),
                meta: {
                    parent: "settings",
                    permission: 'chart_accounts.store',
                },
            },
            {
                path: ":id/edit",
                name: "accounting-plan-update",
                props: true,
                component: () => import('@/views/Settings/accountingPlans/FormAction.vue'),
                meta: {
                    parent: "settings",
                    permission: 'chart_accounts.update',
                },
            },
            {
                path: ":id",
                name: "accounting-plan-show",
                props: true,
                component: () => import('@/views/Settings/accountingPlans/FormAction.vue'),
                meta: {
                    parent: "settings",
                    permission: 'chart_accounts.show',
                },
            },
        ],
    },
] 
  