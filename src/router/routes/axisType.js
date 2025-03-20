export default [
    {
        path: "/settings/axis-type",
        name: "axis-type-parent",
        redirect: { name: "axis-type-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "axis-type-list",
                component: () => import('@/views/settings/axisTypes/index.vue'),
                meta: {
                    parent: "settings",
                    permission: 'axis_types.index',
                    moduleName:"axis-types"
                },
            },

        ],
    },
] 
  