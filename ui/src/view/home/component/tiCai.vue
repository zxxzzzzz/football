<template>
  <div>
    <Table :dataSource="dataSource" :columns="columns" :pagination="false"></Table>
    <div class="flex">
      <div v-for="item in scoreItemList">
        <div class="mr-4 mb-2">{{ item.title }}</div>
        <div class="flex mr-4 mb-2" v-for="oddItem in item.itemList">
          <div class="mr-1">
            <div>{{ oddItem.content[0] }}</div>
            <Highlight :content="oddItem.content[1]" :index="oddItem.index"></Highlight>
          </div>
        </div>
      </div>
      <div v-for="item in halfItemList">
        <div class="mr-4 mb-2">{{ item.title }}</div>
        <div class="flex mr-4 mb-2" v-for="oddItem in item.itemList">
          <div class="mr-1">
            <div>{{ oddItem.content[0] }}</div>
            <Highlight :content="oddItem.content[1]" :index="oddItem.index"></Highlight>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted } from 'vue';
import { Table, Tag } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import Highlight from './highlight.vue';
import { Score } from '../enum';

interface Item {
  oddsTitle: string;
  oddsItemList: string[][];
}
type Rev = {
  isMatch: boolean;
  type: string;
  tiCaiOdds: number;
  extraOdds: number;
  tiCai: number;
  extra: number;
  rev: number;
};
type Rev2 = {
  tiCaiOdds: number;
  extraOdds: number;
  tiCai: string;
  extra: string;
  rev: number;
};
const props = defineProps<{ itemList: Item[]; revList: Rev[]; scoreRevList: Rev2[]; halfRevList: Rev2[] }>();
const dataSource = computed(() => {
  return (props.itemList.filter((item) => item.oddsTitle === '胜平负')?.[0]?.oddsItemList || []).map((odds) => {
    return {
      score: parseFloat(odds[0]),
      scoreTitle: odds[0] === Score.noSale ? '未开售' : odds[0],
      win: parseFloat(odds[1]),
      draw: parseFloat(odds[2]),
      lose: parseFloat(odds[3]),
    };
  });
});
const scoreItemList = computed(() => {
  return props.itemList
    .filter((a) => a.oddsTitle === '得分')
    .map((item) => {
      return {
        title: item.oddsTitle,
        itemList: item.oddsItemList.map((oddsItem) => {
          const index = props.scoreRevList.findIndex((s) => oddsItem[0] === s.tiCai && parseFloat(oddsItem[1]) === s.tiCaiOdds);
          return {
            index: index === -1 ? -1 : index + 2,
            content: oddsItem,
          };
        }),
      };
    });
});
const halfItemList = computed(() => {
  return props.itemList
    .filter((a) => a.oddsTitle === '半场')
    .map((item) => {
      return {
        title: item.oddsTitle,
        itemList: item.oddsItemList.map((oddsItem) => {
          const index = props.halfRevList.findIndex((s) => oddsItem[0] === s.tiCai);
          return {
            index: index === -1 ? -1 : index + 4,
            content: oddsItem,
          };
        }),
      };
    });
});
const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
  // {title:'球队', customRender(){return '-'}},
  { title: '让球', dataIndex: 'scoreTitle', minWidth: 48 },
  {
    title: '胜',
    dataIndex: 'win',
    customRender({ record }) {
      const revIndexList = props.revList
        .map((d, i) => [d, i] as const)
        .filter(([r, i]) => {
          return r.tiCai === record.score && r.tiCaiOdds === record.win && r.type === 'win';
        })
        .map((d) => d[1]);
      if (revIndexList.length) {
        return h(Highlight, { content: record.win, index: revIndexList });
      }
      return record.win;
    },
  },
  { title: '平', dataIndex: 'draw' },
  {
    title: '负',
    dataIndex: 'lose',
    customRender({ record }) {
      const revIndexList = props.revList
        .map((d, i) => [d, i] as const)
        .filter(([r, i]) => {
          return r.tiCai === record.score && r.tiCaiOdds === record.lose && r.type === 'lose';
        })
        .map((d) => d[1]);
      if (revIndexList.length) {
        return h(Highlight, { content: record.lose, index: revIndexList });
      }
      return record.lose;
    },
  },
];
</script>
