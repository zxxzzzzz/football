<template>
  <div>
    <Table :dataSource="dataSource" :columns="columns" :pagination="false"></Table>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted } from 'vue';
import { Table } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import Highlight from './highlight.vue';
import {Score} from '../enum';

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
const props = defineProps<{ item: Item; revList: Rev[] }>();
const dataSource = computed(() => {
  return props.item.oddsItemList.map((odds) => {
    return {
      score: parseFloat(odds[0]),
      scoreTitle:odds[0] === Score.noSale ? '未开售': odds[0],
      win: parseFloat(odds[1]),
      draw: parseFloat(odds[2]),
      lose: parseFloat(odds[3]),
    };
  });
});
const columns: TableProps<typeof dataSource.value[0]>['columns'] = [
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
