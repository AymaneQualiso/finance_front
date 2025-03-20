export default [
  {
    path: "/balance",
    name: "balance-parent",
    redirect: { name: "balance-list" },
    // component: () => import('@/views/balance/list.vue'), // Ensures the list component is loaded
    children: [
      {
        path: "list",
        name: "balance-list",
        component: () => import('@/views/balance/list.vue'), // No need to change the component import
        meta: { parent: "balance",moduleName: "balances" },

      },
      {
        path: "details/:id?",
        name: "balance-details",
        component: () => import('@/views/balanceDetails/list.vue'),
        meta: { parent: "balance",moduleName: "balances" },

      },
    ],
  },
]
