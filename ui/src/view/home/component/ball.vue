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
const props = defineProps<{ itemList: Item[]; revList: Rev[]; halfRevList: Rev2[] }>();
const dataSource = computed(() => {
  return props.itemList.map((item) => {
    const oddsItemList = item.oddsItemList;
    if (item.oddsTitle === '独赢') {
      return {
        score: 0,
        scoreText: '独赢',
        win: parseFloat(oddsItemList[0][0]),
        draw: parseFloat(oddsItemList[2][0]),
        lose: parseFloat(oddsItemList[1][0]),
      };
    }
    return {
      scoreText: oddsItemList[0][0],
      score: parseFloat(oddsItemList[0][0]),
      win: parseFloat(oddsItemList[0][1]),
      draw: '-',
      lose: parseFloat(oddsItemList[1][1]),
    };
  });
});
const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
  // {title:'球队', customRender(){return '-'}},
  { title: '让球', dataIndex: 'scoreText', minWidth: 48 },
  {
    title: '胜',
    dataIndex: 'win',
    customRender({ record }) {
      const revIndexList = props.revList
        .map((d, i) => [d, i] as const)
        .filter(([r, i]) => {
          if (record.scoreText === '独赢') {
            return r.extraOdds === record.win && r.isOnlyWin && r.type === 'lose';
          }
          return r.extra === record.score && r.extraOdds === record.win && r.type === 'lose' && !r.isOnlyWin;
        })
        .map((d) => d[1]);
      const halfRevIndexList = props.halfRevList
        .map((d, i) => [d, i] as const)
        .filter(([r, i]) => {
          return parseFloat(r.extra) === record.score && r.type === 'lose' && !r.isOnlyWin;
        })
        .map((d) => d[1] + 4);
      if ([...revIndexList, ...halfRevIndexList].length) {
        return h(Highlight, { content: record.win, index: [...revIndexList, ...halfRevIndexList] });
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
          if (record.scoreText === '独赢') {
            return r.extraOdds === record.lose && r.isOnlyWin && r.type === 'win';
          }
          return r.extra === record.score && r.extraOdds === record.lose && r.type === 'win' && !r.isOnlyWin;
        })
        .map((d) => d[1]);
      const halfRevIndexList = props.halfRevList
        .map((d, i) => [d, i] as const)
        .filter(([r, i]) => {
          return parseFloat(r.extra) === record.score  && r.type === 'win' && !r.isOnlyWin;
        })
        .map((d) => d[1] + 4);
      if ([...revIndexList, ...halfRevIndexList].length) {
        return h(Highlight, { content: record.win, index: [...revIndexList, ...halfRevIndexList] });
      }
      return record.lose;
    },
  },
];
</script>
