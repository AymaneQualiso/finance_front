export default [
  {
    path: "/settings/account-types",
    name: "account-types-parent",
    redirect: { name: "account-types-list" },
    component: () => import('@/pages/settings.vue'),
    children: [
      {
        path: "list",
        name: "account-types-list",
        component: () => import('@/views/Settings/accountTypes/index.vue'),
        meta: {
          parent: "settings",
          permission: 'account_types.index',
          moduleName:"account-types"
        },
      },
      // {
      //   path: "create",
      //   name: "account-types-create",
      //   component: () => import('@/views/settings/accountTypes/FormAction.vue'),
      //   meta: {
      //     permission: 'account_types.store',
      //   },
      // },
      // {
      //   path: ":id/edit",
      //   name: "account-types-update",
      //   props: true,
      //   component: () => import('@/views/settings/accountTypes/FormAction.vue'),
      //   meta: {
      //     permission: 'account_types.update',
      //   },
      // },
      // {
      //   path: ":id",
      //   name: "account-types-show",
      //   props: true,
      //   component: () => import('@/views/settings/accountTypes/FormAction.vue'),
      //   meta: {
      //     permission: 'account_types.show',
      //   },
      // },
    ],
  },
]
