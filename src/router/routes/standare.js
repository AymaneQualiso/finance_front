export default [
  {
    path: "/standare",
    name: "standare-parent",
    redirect: { name: "standare-list" },
    component: () => import('@/pages/settings.vue'),
    children: [
      {
        path: "list",
        name: "standare-list",
        component: () => import('@/views/Settings/Standare/index.vue'),
        meta: {
          parent: "settings",
          permission: 'standard.index',
          moduleName: 'standards',
        },
      },
      {
        path: "list_category/:id?",
        name: "category-list",
        component: () => import('@/views/Settings/Categories/index.vue'),
        meta: { parent: "settings" },
      },

      {
        path: "list_subCategory/:id?",
        name: "Subcategory-list",
        component: () => import('@/views/Settings/SubCategory/index.vue'),
        meta: { parent: "settings" },
      },
      {
        path: "list_section/:id?",
        name: "Section-list",
        component: () => import('@/views/Settings/Sections/index.vue'),
        meta: { parent: "settings" },
      },
    ],
  },
];
