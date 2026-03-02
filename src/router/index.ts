import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/layout/MainLayout.vue'
import HomeView from '@/views/HomeView.vue'
import MenuView from '@/views/MenuView.vue'
import CartView from '@/views/CartView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ProductDetail from '@/views/product/ProductDetail.vue'
import CheckoutPage from '@/views/member/CheckoutPage.vue'
import OrderListPage from '@/views/member/OrderListPage.vue'
import OrderDetailPage from '@/views/member/OrderDetailPage.vue'
import NotFoundView from '@/views/NotFoundView.vue'

// 路由定义
const routes: RouteRecordRaw[] = [
  // 独立页面（不使用 MainLayout，有自己的背景）
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录', guestOnly: true, hideGlobalBg: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: '注册', guestOnly: true, hideGlobalBg: true }
  },
  // 主布局页面
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { title: '首页' }
      },
      {
        path: 'menu',
        name: 'menu',
        component: MenuView,
        meta: { title: '菜单' }
      },
      {
        path: 'member/cart',
        name: 'cart',
        component: CartView,
        alias: '/cart',
        meta: { title: '购物车', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
        meta: { title: '个人中心', requiresAuth: true }
      },
      // Product routes
      {
        path: 'product/:id',
        name: 'product-detail',
        component: ProductDetail,
        meta: { title: '商品详情' }
      },
      // Member routes (require authentication)
      {
        path: 'member/checkout',
        name: 'checkout',
        component: CheckoutPage,
        meta: { title: '确认订单', requiresAuth: true }
      },
      {
        path: 'member/orders',
        name: 'order-list',
        component: OrderListPage,
        meta: { title: '时光账单', requiresAuth: true }
      },
      {
        path: 'member/orders/:orderNo',
        name: 'order-detail',
        component: OrderDetailPage,
        meta: { title: '订单详情', requiresAuth: true }
      },
      {
        path: 'points',
        name: 'points-center',
        component: () => import('@/views/PointsCenterView.vue'),
        meta: { title: '光阴小铺', requiresAuth: true }
      },
      {
        path: 'coupons',
        name: 'my-coupons',
        component: () => import('@/views/MyCouponsView.vue'),
        meta: { title: '我的优惠券', requiresAuth: true }
      }
    ]
  },
  // 404 Catch-all
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
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
