import { createRouter, createWebHashHistory } from 'vue-router';
import { routeList } from './route';
import store from '@/store';

export const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes: routeList, // `routes: routes` 的缩写
});

router.beforeEach((to, from) => {
  if (!store.password && to.path !== '/login') {
    return { path: '/login' };
  }

});
