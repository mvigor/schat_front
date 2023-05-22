
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },
  {
    path: '/new',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/NewRoom') }
    ]
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/login') }
    ]
  },
  {
    path: '/login/:invite',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/login') }
    ]
  },
  {
    path: '/logout',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/logout') }
    ]
  },
  {
    path: '/room/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Room') }
    ]
  },
  {
    path: '/join/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index') }
    ]
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Users') }
    ]
  },
  {
    path: '/rooms',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Rooms') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
