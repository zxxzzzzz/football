import { createApp } from 'vue';
import 'virtual:windi.css';
import App from './App.vue';
import { router } from '@/route/index';
import 'ant-design-vue/dist/antd.css';


const app = createApp(App);
app.use(router);
app.mount('#app');
