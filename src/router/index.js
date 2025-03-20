const routeModules = import.meta.glob(['./routes/*.js'], { eager: true })

const routes = Object.values(routeModules).flatMap(module => module.default)

export default routes
