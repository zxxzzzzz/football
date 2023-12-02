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
import { Rev } from '../type';
interface Item {
  oddsTitle: string;
  oddsItemList: string[][];
}

const props = defineProps<{ itemList: Item[]; revList: Rev[] }>();
const dataSource = computed(() => {
  return props.itemList
    .filter((item) => item.oddsTitle === '让球')
    .map((item) => {
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
    customRender({ record, index }) {
      const isMatch =
        props.revList?.[0]?.extraType === 'win' &&
        record.scoreText === props.revList?.[0]?.extraScore &&
        record.win === parseFloat(props.revList[0].b);
      return isMatch ? h(Highlight, { index: 0, content: record.win.toFixed(2) }) : record.win.toFixed(2);
    },
  },
  {
    title: '负',
    dataIndex: 'lose',
    customRender({ record, index }) {
      const isMatch =
        props.revList?.[0]?.extraType === 'lose' &&
        record.scoreText === props.revList?.[0]?.extraScore &&
        record.lose === parseFloat(props.revList[0].b);
      return isMatch ? h(Highlight, { index: 0, content: record.lose.toFixed(2) }) : record.lose.toFixed(2);
    },
  },
];
</script>
../type