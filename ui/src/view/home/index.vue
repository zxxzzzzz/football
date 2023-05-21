<template>
  <div>
    <div class="bg-white">&nbsp;</div>
    <div class="bg-gray-100">&nbsp;</div>
    <div class="mx-4">
      <Table :dataSource="dataSource" :columns="columns" bordered :rowClassName="rowClassName" :pagination="pagination"></Table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Table } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
// import { data, dataList } from './mock';
// import { SourceType } from '@/type/enum';
import { computed, h, ref, onMounted, watch } from 'vue';
import Match from './component/match.vue';
import TiCai from './component/tiCai.vue';
import Extra from './component/extra.vue';
import { message, Input } from 'ant-design-vue';
// import { Game } from './type';
import Rev from './component/rev.vue';

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
// const dataList = ref<Game[]>([]);
const dataSource = ref<D[]>([]);
// 全局r变量
const pagination: TableProps['pagination'] = {
  pageSize: 300,
};
onMounted(async () => {
  const origin = location.origin;
  setInterval(async () => {
    if(!document.hidden){
      const res = await fetch(origin + '/data');
      const data = await res.json();
      if (data?.length) {
        dataSource.value = data;
      }
    }
  }, 10 * 1000);
  const res = await fetch(origin + '/data');
  const data = await res.json();
  if (data?.length) {
    dataSource.value = data;
  }
});

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
