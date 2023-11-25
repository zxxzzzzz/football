<template>
  <div>
    <Table :dataSource="dataSource" :columns="columns" :pagination="false"></Table>
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
  return props.itemList.filter((item) => item.oddsTitle === '让球').map(d => d.oddsItemList).flat().map((odds) => {
    return {
      ratio: parseFloat(odds[1]),
      scoreTitle: odds[0] === Score.noSale ? '未开售' : odds[0],
    };
  });
});
const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
  // {title:'球队', customRender(){return '-'}},
  { title: '让球', dataIndex: 'scoreTitle', minWidth: 48 },
  {
    title: '赔率',
    dataIndex: 'ratio',
  },
];
</script>
