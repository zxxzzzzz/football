<template>
  <div>
    <Table :dataSource="dataSource" :columns="columns" :pagination="false"></Table>
    <!-- <div>
      {{ props.revList }}
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import { Table, TableProps } from 'ant-design-vue';
import { computed, h } from 'vue';
import Highlight from './highlight.vue';
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
  isOnlyWin: boolean;
};
type Rev2 = {
  type: string;
  isOnlyWin: boolean;
  tiCaiOdds: number;
  extraOdds: number;
  tiCai: string;
  extra: string;
  rev: number;
};
const props = defineProps<{ itemList: Item[] }>();
const dataSource = computed(() => {
  return props.itemList.filter(item => item.oddsTitle === '让球').map((item) => {
    const oddsItemList = item.oddsItemList;
    return {
      scoreText: oddsItemList[0][0],
      win: parseFloat(oddsItemList[0][1]),
      lose: parseFloat(oddsItemList[0][2]),
    };
  });
});
const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
  // {title:'球队', customRender(){return '-'}},
  { title: '让球', dataIndex: 'scoreText', minWidth: 48 },
  {
    title: '胜',
    dataIndex: 'win',
  },
  {
    title: '负',
    dataIndex: 'lose',
  },
];
</script>
