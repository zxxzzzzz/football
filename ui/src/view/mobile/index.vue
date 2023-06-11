<template>
  <div>
    <List item-layout="horizontal" :data-source="message1List">
      <template #renderItem="{ item }">
        <div class="flex flex-wrap mb-2">
          <div v-for="(t, index) in item.split(' ')" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
            {{ t }}
          </div>
        </div>
      </template>
    </List>
    <Divider></Divider>
    <List item-layout="horizontal" :data-source="message2List">
      <template #renderItem="{ item }">
        <div class="mb-2">
          <div class="flex flex-wrap">
            <div v-for="(t, index) in item[0].split(' ')" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
              {{ t }}
            </div>
          </div>
          <div class="flex flex-wrap">
            <div v-for="(t, index) in item[1].split(' ')" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
              {{ t }}
            </div>
          </div>
        </div>
      </template>
    </List>
    <Divider></Divider>
    <List item-layout="horizontal" :data-source="message3List">
      <template #renderItem="{ item }">
        <div class="flex flex-wrap mb-2">
          <div v-for="(t, index) in item.split(' ')" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
            {{ t }}
          </div>
        </div>
      </template>
    </List>
    <Divider></Divider>
      <List item-layout="horizontal" :data-source="message4List">
        <template #renderItem="{ item }">
          <div class="flex flex-wrap mb-2">
            <div v-for="(t, index) in item.split(' ')" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
              {{ t }}
            </div>
          </div>
        </template>
      </List>
    <Affix :offsetBottom="400" :style="{ position: 'absolute', right: 0 + 'px' }">
      <div class="flex flex-col">
        <Button class="my-2" @click="handleSetting"> 设置</Button>
      </div>
    </Affix>
  </div>
</template>
<script lang="ts" setup>
import { Table, Drawer, List, Button, Affix, Divider, message } from 'ant-design-vue';
import { computed, h, ref, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import store from '@/store';

const router = useRouter();
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
  scoreRevList: {
    teamList: string[];
    num: string | undefined;
    ecid: '6841929';
    tiCaiOdds: string;
    extraOdds: string;
    tiCai: number;
    extra: number;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
  }[];
  revList: {
    teamList: string[];
    num: string | undefined;
    ecid: '6841929';
    isMatch: boolean;
    isOnlyWin: boolean;
    type: string;
    tiCaiOdds: number;
    extraOdds: number;
    tiCai: number;
    extra: number;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
  }[];
};

const colors = [
  '#78a5de',
  '#4fb2a1',
  '#205a13',
  '#186174',
  '#88b00b',
  '#cf4b22',
  '#9e57cd',
  '#238910',
  '#c18fde',
  '#673b84',
  '#760bbb',
  '#557766',
  '#557733',
  '#337755',
];

enum Code {
  success = 200,
  wrongAccount = 403,
  dataFail = 404,
  accountUnknownFail = 601,
  maintain = 619,
  uidExpire = 801,
  forbidden = 401,
}

// const dataList = ref<Game[]>([]);
const dataSource = ref<D[]>([]);

const message1List = ref<string[]>([]);
const message2List = ref<string[]>([]);
const message3List = ref<string[]>([]);
const message4List = ref<string[]>([]);
let timeId: ReturnType<typeof setTimeout> | undefined = void 0;

async function getData() {
  const origin = import.meta.env.DEV ? 'http://127.0.0.1:9000' : location.origin;
  const res = await fetch(`${origin}/data?p=${store.password}`);
  const data = (await res.json()) as { code: number; msg: string; data?: any };
  if (data.code !== 200) {
    message.error(data?.msg || '更新出错', 20);
    // 某些错误下 ，不再就行请求
    if (data?.code === Code.maintain) {
      message.info('已停止数据自动更新', 10);
      return false;
    }
    if (data?.code === Code.accountUnknownFail) {
      message.info('为了保证账号安全，已停止数据自动更新。刷新页面可开始继续自动更新', 10);
      return false;
    }
    if (data.code === Code.forbidden) {
      store.password = '';
      localStorage.setItem('ps', '');
      router.push({ path: '/login' });
      return false;
    }
  }
  if (data.data?.matchData?.length) {
    message.success('数据更新成功');
    dataSource.value = data.data.matchData;
    message1List.value = data.data.message1List;
    message2List.value = data.data.message2List;
    message3List.value = data.data.message3List;
    message4List.value = data.data.message4List;
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
const handleSetting = () => {
  router.push({ path: '/setting' });
};
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
</script>
