<template>
  <div>
    <div class="bg-white">&nbsp;</div>
    <div class="bg-gray-100">&nbsp;</div>
    <div class="mx-4">
      <Table :dataSource="sortDataSource" :columns="columns" bordered :rowClassName="rowClassName" :pagination="pagination"></Table>
    </div>
    <Affix :offsetBottom="400" :style="{ position: 'absolute', right: 0 + 'px' }">
      <div class="flex flex-col">
        <Button type="primary" @click="() => (drawerVisible = true)" class="my-2"> 消息</Button>
        <Button type="primary" @click="handleSort" class="my-2">{{ sortName }}</Button>
        <Button class="my-2" @click="handleSetting"> 设置</Button>
        <Button class="my-2" @click="router.push('/')"> 足球</Button>
      </div>
    </Affix>
  </div>
</template>
<script lang="ts" setup>
import { Table, Drawer, List, Button, Affix, Divider, message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
// import { data, dataList } from './mock';
// import { SourceType } from '@/type/enum';
import { computed, h, ref, onMounted, watch, onUnmounted } from 'vue';
import Match from './component/match.vue';
import TiCai from './component/tiCai.vue';
import Extra from './component/extra.vue';
// import { Game } from './type';
import Rev from './component/rev.vue';
import dayjs from 'dayjs';
import { useRouter, useRoute } from 'vue-router';
import store from '@/store';

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
  scoreRevList: {
    teamList: string[];
    num: string | undefined;
    ecid: string;
    tiCaiOdds: number;
    extraOdds: number;
    tiCai: string;
    extra: string;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
  }[];
  halfRevList: {
    teamList: string[];
    num: string | undefined;
    ecid: string;
    tiCaiOdds: number;
    extraOdds: number;
    tiCai: string;
    extra: string;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
    isOnlyWin: boolean;
    type: string;
  }[];
  revList: {
    teamList: string[];
    num: string | undefined;
    ecid: string;
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
  interError = 500,
}

// const dataList = ref<Game[]>([]);
const dataSource = ref<D[]>([]);
const sortDataSource = computed(() => {
  // if (sortType.value === SortType.normal) {
  return dataSource.value.sort((a, b) => dayjs(a.dateTime, 'MM-DD HH:ss').valueOf() - dayjs(b.dateTime, 'MM-DD HH:ss').valueOf());
  // }
});
let timeId: ReturnType<typeof setTimeout> | undefined = void 0;
// 是否按照rev排序
const enum SortType {
  normal,
  rev,
  score,
}
const sortType = ref(SortType.rev);
const sortName = computed(() => {
  if (sortType.value === SortType.normal) {
    return '用rev排序';
  }
  if (sortType.value === SortType.rev) {
    return '用得分排序';
  }
  if (sortType.value === SortType.score) {
    return '用时间排序';
  }
  return '';
});

const drawerVisible = ref(false);
// 全局r变量
const pagination: TableProps['pagination'] = {
  pageSize: 300,
};

async function getData() {
  if (route.path !== '/basketball') {
    return false
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

const handleSort = () => {
  if (sortType.value === SortType.normal) {
    sortType.value = SortType.rev;
    return;
  }
  if (sortType.value === SortType.rev) {
    sortType.value = SortType.score;
    return;
  }
  if (sortType.value === SortType.score) {
    sortType.value = SortType.normal;
    return;
  }
  return SortType.normal;
};

const handleSetting = () => {
  router.push({ path: '/setting' });
};

const rowClassName: TableProps['rowClassName'] = (_, index) => {
  const m = ['bg-white', 'bg-gray-100'];
  return m[index % 2];
};

type Record = (typeof dataSource.value)[0];
const columns: TableProps<Record>['columns'] = [
  {
    title: '赛事',
    customRender({ record }) {
      return h(Match, {
        dateTime: record.dateTime,
        tiCaiTeamList: record.tiCaiTeamList,
        extraTeamList: record.extraTeamList,
        leagueName: record.league,
        num: record.num,
      });
    },
  },
  {
    title: '体彩',
    customRender({ record }) {
      return h(TiCai, {
        teamList: record.tiCaiTeamList,
        itemList: record.tiCaiItemList,
        revList: record.revList,
        scoreRevList: record.scoreRevList,
        halfRevList: record.halfRevList,
      });
    },
  },
  {
    title: '外部',
    customRender({ record }) {
      return h(Extra, {
        teamList: record.extraTeamList,
        itemList: record.extraItemList.filter((e) => ['让球', '总分', '独赢'].includes(e.oddsTitle)),
        revList: record.revList,
        halfRevList: record.halfRevList,
        scoreRevList: record.scoreRevList,
      });
    },
  },
];
</script>
