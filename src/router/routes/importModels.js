export default [
    {
        path: "/settings/import-models",
        name: "import-models-parent",
        redirect: { name: "import-models-list" },
        component: () => import('@/pages/settings.vue'),
        children: [
            {
                path: "list",
                name: "import-models-list",
                component: () => import('@/views/Settings/importModels/index.vue'),
                meta: {
                    parent: "settings",
                    permission: 'import_models.index',
                },
            },
        ],
    },
]
