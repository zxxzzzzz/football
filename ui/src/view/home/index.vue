<template>
  <div>
    <div class="bg-white">&nbsp;</div>
    <div class="bg-gray-100">&nbsp;</div>
    <div class="mx-4">
      <Table :dataSource="dataSource" :columns="columns" bordered :rowClassName="rowClassName" :pagination="pagination"></Table>
    </div>
    <Drawer width="640" placement="right" :closable="true" :visible="drawerVisible" :mask="true" @close="onClose">
      <List item-layout="horizontal" :data-source="message1List">
        <template #renderItem="{ item }">
          <div style="display: flex">
            <div v-for="(t, index) in item.split(' ')" :style="{ color: colors[index], margin: '0 4px' }">{{ t }}</div>
          </div>
        </template>
      </List>
      <Divider></Divider>
      <List item-layout="horizontal" :data-source="message2List">
        <template #renderItem="{ item }">
          <div style="margin: 4px 0">
            <div style="display: flex">
              <div v-for="(t, index) in item[0].split(' ')" :style="{ color: colors[index], margin: '0 4px' }">{{ t }}</div>
            </div>
            <div style="display: flex">
              <div v-for="(t, index) in item[1].split(' ')" :style="{ color: colors[index], margin: '0 4px' }">{{ t }}</div>
            </div>
          </div>
        </template>
      </List>
    </Drawer>
    <Affix :offsetBottom="400" :style="{ position: 'absolute', right: 0 + 'px' }">
      <Button type="primary" @click="() => (drawerVisible = true)"> 消息</Button>
    </Affix>
  </div>
</template>
<script lang="ts" setup>
import { Table, Drawer, List, Button, Affix, Divider, message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
// import { data, dataList } from './mock';
// import { SourceType } from '@/type/enum';
import { computed, h, ref, onMounted, watch } from 'vue';
import Match from './component/match.vue';
import TiCai from './component/tiCai.vue';
import Extra from './component/extra.vue';
// import { Game } from './type';
import Rev from './component/rev.vue';
import { countBy } from 'ramda';

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
  '#77b164',
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

// const dataList = ref<Game[]>([]);
const dataSource = ref<D[]>([]);
const message1List = ref<string[]>([]);
const message2List = ref<string[]>([]);

const drawerVisible = ref(false);
// 全局r变量
const pagination: TableProps['pagination'] = {
  pageSize: 300,
};

const userKey = new Date().valueOf();
async function getData() {
  const origin = location.origin; // 'http://127.0.0.1:9000'; //location.origin;
  const url = new URL(location.href);
  const res = await fetch(
    origin + '/data?username=' + url.searchParams.get('username') || '' + '&password=' + url.searchParams.get('password') || ''
  );
  const data = (await res.json()) as { code: number; msg: string; data?: any };
  if (data.code !== 200) {
    message.error(data.msg);
  }
  if (data.data?.matchData?.length) {
    dataSource.value = data.data.matchData;
    message1List.value = data.data.message1List;
    message2List.value = data.data.message2List;
  }
}
async function cInter(cb: () => Promise<void>, n: number) {
  await cb();
  setTimeout(async () => {
    await cInter(cb, n);
  }, n);
}
onMounted(async () => {
  await getData();
  cInter(async () => {
    if (!document.hidden) {
      await getData();
    }
  }, 5 * 1000);
});

const onClose = () => {
  drawerVisible.value = false;
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
        teamList: record.tiCaiTeamList,
        leagueName: record.league,
        num: record.num,
      });
    },
  },
  {
    title: '体彩',
    customRender({ record }) {
      return h(TiCai, { teamList: record.tiCaiTeamList, item: record.tiCaiItemList[0], revList: record.revList });
    },
  },
  {
    title: '外部',
    customRender({ record }) {
      return h(Extra, {
        teamList: record.extraTeamList,
        itemList: record.extraItemList.filter((e) => ['让球', '得分', '独赢'].includes(e.oddsTitle)),
        revList: record.revList,
      });
    },
  },
  {
    title: 'Rev',
    customRender({ record }) {
      return h(Rev, {
        itemList: record.revList,
      });
    },
  },
];
</script>
