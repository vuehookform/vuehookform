import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { categories, getDefaultRoute } from '@/data/categories'

// Generate routes dynamically from categories
const exampleRoutes: RouteRecordRaw[] = categories.flatMap((category) =>
  category.examples.map((example) => ({
    path: `/examples/${category.id}/${example.id}`,
    name: `example-${category.id}-${example.id}`,
    component: example.component,
    meta: {
      categoryId: category.id,
      exampleId: example.id,
    },
  })),
)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Back/forward navigation: restore saved position
    if (savedPosition) {
      return savedPosition
    }

    // Initial page load (no previous route): show header at top
    if (!from.name) {
      return { top: 0 }
    }

    // Example-to-example navigation: scroll to main-layout (below sticky nav)
    return {
      el: '.main-layout',
      top: 112,
      behavior: 'instant',
    }
  },
  routes: [
    // Redirect root to first example
    {
      path: '/',
      redirect: () => {
        const { category, example } = getDefaultRoute()
        return `/examples/${category}/${example}`
      },
    },
    // All example routes
    ...exampleRoutes,
    // Catch-all redirect
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
