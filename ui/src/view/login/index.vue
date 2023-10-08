<template>
  <div class="flex justify-center items-center h-[100vh]">
    <div>v1.0.2</div>
    <div class="mr-4">通行码</div>
    <div>
      <Input v-model:value="password"></Input>
    </div>
    <div>
      <Button @click="handleLogin">登录</Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Input, Button, message } from 'ant-design-vue';
import { ref } from 'vue';
import store from '@/store';
import { useRouter } from 'vue-router';

const router = useRouter();
const password = ref('');

const handleLogin = () => {
  store.password = password.value;
  localStorage.setItem('ps', store.password);
  router.push({ path: '/home' });
  return;
};
</script>
