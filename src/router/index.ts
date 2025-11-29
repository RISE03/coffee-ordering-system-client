import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/layout/MainLayout.vue'

// 路由定义
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/MenuView.vue'),
        meta: { title: '菜单' }
      },
      {
        path: 'member/cart',
        name: 'cart',
        component: () => import('@/views/CartView.vue'),
        alias: '/cart',
        meta: { title: '购物车', requiresAuth: true }
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { title: '登录', guestOnly: true }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/RegisterView.vue'),
        meta: { title: '注册', guestOnly: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      // Product routes
      {
        path: 'product/:id',
        name: 'product-detail',
        component: () => import('@/views/product/ProductDetail.vue'),
        meta: { title: '商品详情' }
      },
      // Member routes (require authentication)
      {
        path: 'member/checkout',
        name: 'checkout',
        component: () => import('@/views/member/CheckoutPage.vue'),
        meta: { title: '确认订单', requiresAuth: true }
      },
      {
        path: 'member/orders',
        name: 'order-list',
        component: () => import('@/views/member/OrderListPage.vue'),
        meta: { title: '我的订单', requiresAuth: true }
      },
      {
        path: 'member/orders/:orderNo',
        name: 'order-detail',
        component: () => import('@/views/member/OrderDetailPage.vue'),
        meta: { title: '订单详情', requiresAuth: true }
      }
    ]
  },
  // 404 Catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  // 设置页面标题
  document.title = `${to.meta.title ? to.meta.title + ' - ' : ''}Dawn & Dusk`

  // 1. 检查是否需要登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 2. 检查是否仅访客可见 (如登录页)
  if (to.meta.guestOnly && isLoggedIn) {
    next({ path: '/' })
    return
  }

  next()
})

export default router
