<template>
  <div>
    <div class="bg-white">&nbsp;</div>
    <div class="bg-gray-100">&nbsp;</div>
    <Message :message-list="message1List"></Message>
    <Message :message-list="message2List"></Message>
    <Affix :offsetBottom="400" :style="{ position: 'absolute', right: 0 + 'px' }">
      <div class="flex flex-col">
        <Button class="my-2" @click="handleSetting"> 设置</Button>
        <Button class="my-2" @click="router.push('/')"> 足球</Button>
      </div>
    </Affix>
  </div>
</template>
<script lang="ts" setup>
import { Table, Button, Affix, message } from 'ant-design-vue';
import { computed, h, ref, onMounted, watch, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store';
import { Rev } from './type';
import Message from './component/message.vue';

const router = useRouter();
const route = useRoute();

// defineProps<{}>();
type D = {
  league: string;
  num: string;
  dateTime: string;
  tiCaiTeamList: string[];
  extraTeamList: string[];
  tiCaiItemList: {
    oddsTitle: string;
    oddsItemList: string[][];
  }[];
  extraItemList: {
    oddsTitle: string;
    oddsItemList: string[][];
  }[];
  revList: Rev[];
  scoreRevList: Rev[];
};



enum Code {
  success = 200,
  wrongAccount = 403,
  dataFail = 404,
  accountUnknownFail = 601,
  maintain = 619,
  uidExpire = 801,
  forbidden = 401,
  interError = 500,
}

// const dataList = ref<Game[]>([]);
const dataSource = ref<D[]>([]);

let timeId: ReturnType<typeof setTimeout> | undefined = void 0;
const resData = ref<any>()

const message1List = computed(() => {
  return resData.value?.message1List || []
})
const message2List = computed(() => {
  return resData.value?.message2List || []
})

async function getData() {
  if (route.path !== '/mobile/basketball') {
    return false;
  }
  const origin = import.meta.env.DEV ? 'http://data.fcv3.1048992591952509.cn-hangzhou.fc.devsapp.net' : location.origin;
  const res = await fetch(`${origin}/basketballData/?p=${store.password}&token=${store.token}`);
  const data = (await res.json()) as { code: number; msg: string; data?: any };
  if (data.code !== 200) {
    message.error(data?.msg || '更新出错', 20);
    // 某些错误下 ，不再就行请求
    if (data?.code === Code.maintain) {
      message.info('已停止数据自动更新', 10);
      return false;
    }
    if (data?.code === Code.interError) {
      if (data?.data?.token) {
        localStorage.setItem('token', data?.data?.token);
        store.token = data?.data?.token;
      }
    }
    if (data?.code === Code.accountUnknownFail) {
      message.info('为了保证账号安全，已停止数据自动更新。刷新页面可开始继续自动更新', 10);
      return false;
    }
    if (data.code === Code.forbidden) {
      store.password = '';
      localStorage.setItem('ps', '');
      store.token = '';
      localStorage.setItem('token', '');
      console.log('goto login');
      router.push({ path: '/login' });
      return false;
    }
  }
  if (data.data?.matchData) {
    message.success(
      `数据更新 ${
        data?.data?.timestamp ? '距离当前' + (dayjs().valueOf() - dayjs(data.data.timestamp).valueOf()) / 1000 + '秒' : ''
      }, 在线人数${data?.data?.liveCount || 0}`,
      5
    );
    dataSource.value = data.data.matchData;
    resData.value = data.data;
    localStorage.setItem('token', data.data.token);
    store.token = data.data.token;
  }
  return true;
}
async function cInter(cb: () => Promise<boolean>, n: number) {
  try {
    const d = await cb();
    if (!d) {
      return;
    }
  } catch (error) {}
  timeId = setTimeout(async () => {
    try {
      await cInter(cb, n);
    } catch (error) {}
  }, n);
}
onMounted(async () => {
  // await getData();
  cInter(async () => {
    if (!document.hidden) {
      return await getData();
    }
    return true;
  }, 5 * 1000);
});
onUnmounted(() => {
  if (timeId) {
    clearTimeout(timeId);
  }
});



const handleSetting = () => {
  router.push({ path: '/setting' });
};




</script>
./type
