import { RouteRecordRaw } from 'vue-router';

export const routeList: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/view/login/index.vue'),
  },
  {
    path: '/home',
    component: () => import('@/view/home/index.vue'),
  },
  {
    path: '/mobile',
    component: () => import('@/view/mobile/index.vue'),
  },
  {
    path: '/setting',
    component: () => import('@/view/setting/index.vue'),
  },
  {
    path: '',
    redirect: '/login',
  },
];
