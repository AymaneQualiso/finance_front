export default [
    {
        path: "/settings/attachment_type",
        name: "attachment-type-parent",
        redirect: { name: "attachment-type-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "attachment-type-list",
                component: () => import('@/views/settings/attachmentType/index.vue'),
                meta: {
                    parent: "settings",
                    permission: 'attachment_types.index',
                    moduleName:"attachment-types"
                },
            },

        ],
    },
] 
  