export default [
    {
      path: "/Exercice",
      name: "Exercice-parent",
      redirect: { name: "Exercice-list" },
      component: () => import('@/pages/settings.vue'),
      children: [
        {
          path: "list",
          name: "Exercice-list",
          component: () => import('@/views/Settings/Exercice/index.vue'),
          meta: {
            parent: "settings",
            permission: 'Exercices.index',
            moduleName: 'Exercice',
          },
        },
       
      ],
    },
  ];
  