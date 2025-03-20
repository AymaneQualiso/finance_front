export default [
  {
    path: "/route",
    name: "route-name",
    redirect: { name: "route-1" },
    children: [
      {
        path: "route-1",
        name: "route-1",
        meta: {
          permission: 'route.index',
        },
      },
    ],
  },
] 
