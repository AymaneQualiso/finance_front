import { setupLayouts } from 'virtual:generated-layouts'
// eslint-disable-next-line import/no-unresolved
import { createRouter, createWebHistory } from 'vue-router/auto'
import { redirects, routes } from './additional-routes'
import { setupGuards } from './guards'

function recursiveLayouts(route) {
  if (route.children || route.meta?.layout) 
    return setupLayouts([route])[0]
  
  return route
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth', top: 60 }
    
    return { top: 0 }
  },
  extendRoutes: pages => [
    ...redirects,
    ...[
      ...pages,
      ...routes,
    ].map(route => recursiveLayouts(route)),
  ],
})

setupGuards(router)
export { router }
export default function (app) {
  app.use(router)
}
