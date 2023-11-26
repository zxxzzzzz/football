<template>
  <div>
    <Ball :itemList="props.itemList" ></Ball>
    <div class="flex">
      <div v-for="item in oddsItemList" class="mr-1.5rem">
        <div >总分：{{ item.title }}</div>
        <div>胜&nbsp;&nbsp;&nbsp;：{{ item.win }}</div>
        <div>负&nbsp;&nbsp;&nbsp;：{{ item.lose }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Tag } from 'ant-design-vue';
import { computed } from 'vue';
import Ball from './ball.vue';
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
  tiCaiOdds: number;
  extraOdds: number;
  tiCai: string;
  extra: string;
  rev: number;
};
type Rev3 = {
  type: string;
  isOnlyWin: boolean;
  tiCaiOdds: number;
  extraOdds: number;
  tiCai: string;
  extra: string;
  rev: number;
};
const props = defineProps<{ teamList: string[]; itemList: Item[]; revList: Rev[]; scoreRevList: Rev2[]; halfRevList: Rev3[] }>();

// 总分
const oddsItemList = computed(() => {
  return props.itemList.filter(item => item.oddsTitle === '总分').map((item) => {
    return item.oddsItemList.map((odd) => {
      return {
        title: odd[0],
        win: odd[1],
        lose: odd[2],
      };
    });
  }).flat();
});
</script>
