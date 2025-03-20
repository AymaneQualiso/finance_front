export default [
    {
      path: "/paymentdelay",
      name: "payment-delay-parent",
      redirect: { name: "payment-delay-list" },  
      component: () => import('@/views/payment-delay/index.vue'),
      children: [
        {
          path: "list",
          name: "payment-list",  
          component: () => import('@/views/payment-delay/list.vue'),
          meta: {
            permission: 'payment_delays.index',
          },
        },
        {
          path: "list-new",
          name: "payment-list-new",  
          component: () => import('@/views/payment-delay/list.vue'),
          meta: {
            permission: 'payment_delays.index',
          },
        },
      ],
    },
  ];
  