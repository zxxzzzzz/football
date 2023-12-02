<template>
  <div>
    <Table :dataSource="dataSource" :columns="columns" :pagination="false"></Table>
    <div class="flex">
      <div v-for="item in totalItemList">
        <div>总分：{{ item.scoreTitle }}</div>
        <div class="flex">
          胜&nbsp;&nbsp;&nbsp;：
          <Highlight
            v-if="
              props.scoreRevList?.[0]?.tiCaiType === 'win' &&
              props.scoreRevList?.[0]?.tiCaiScore === item.scoreTitle &&
              parseFloat(props.scoreRevList?.[0]?.a) === item.win
            "
            :index="4"
            :content="item.win.toFixed(2)"
          ></Highlight>
          <span v-else>{{ item.win.toFixed(2) }}</span>
        </div>
        <div class="flex">
          负&nbsp;&nbsp;&nbsp;：
          <Highlight
            v-if="
              props.scoreRevList?.[0]?.tiCaiType === 'lose' &&
              props.scoreRevList?.[0]?.tiCaiScore === item.scoreTitle &&
              parseFloat(props.scoreRevList?.[0]?.a) === item.lose
            "
            :index="4"
            :content="item.lose.toFixed(2)"
          ></Highlight>
          <span v-else>{{ item.lose.toFixed(2) }}</span>
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
  a: string;
  b: string;
  tiCaiScore: string;
  extraScore: string;
  tiCaiType: 'lose' | 'win';
  extraType: 'lose' | 'win';
  rev: number;
};

const props = defineProps<{ itemList: Item[]; revList: Rev[]; scoreRevList: Rev[] }>();
const dataSource = computed(() => {
  return props.itemList
    .filter((item) => item.oddsTitle === '让球')
    .map((d) => d.oddsItemList)
    .flat()
    .map((odds) => {
      return {
        win: parseFloat(odds[1]),
        lose: parseFloat(odds[2]),
        scoreTitle: odds[0] === Score.noSale ? '未开售' : odds[0],
      };
    });
});
// 总分
const totalItemList = computed(() => {
  return props.itemList
    .filter((item) => item.oddsTitle === '总分')
    .map((d) => d.oddsItemList)
    .flat()
    .map((odds) => {
      return {
        win: parseFloat(odds[1]),
        lose: parseFloat(odds[2]),
        scoreTitle: odds[0] === Score.noSale ? '未开售' : odds[0],
      };
    });
});
const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
  // {title:'球队', customRender(){return '-'}},
  { title: '让球', dataIndex: 'scoreTitle', minWidth: 48 },
  {
    title: '胜',
    dataIndex: 'win',
    customRender({ record, index }) {
      const isMatch =
        props.revList?.[0]?.tiCaiType === 'win' &&
        record.scoreTitle === props.revList?.[0]?.tiCaiScore &&
        record.win === parseFloat(props.revList[0].a);
      return isMatch ? h(Highlight, { index: 0, content: record.win.toFixed(2) }) : record.win.toFixed(2);
    },
  },
  {
    title: '负',
    dataIndex: 'lose',
    customRender({ record, index }) {
      const isMatch =
        props.revList?.[0]?.tiCaiType === 'lose' &&
        record.scoreTitle === props.revList?.[0]?.tiCaiScore &&
        record.lose === parseFloat(props.revList[0].a);
      return isMatch ? h(Highlight, { index: 0, content: record.lose.toFixed(2) }) : record.lose.toFixed(2);
    },
  },
];
</script>
