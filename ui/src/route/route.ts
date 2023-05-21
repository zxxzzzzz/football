import { RouteRecordRaw } from 'vue-router';

export const routeList: RouteRecordRaw[] = [
  {
    path: '/home',
    component: () => import('@/view/home/index.vue'),
  },
  {
    path: '',
    redirect: '/home',
  },
];
