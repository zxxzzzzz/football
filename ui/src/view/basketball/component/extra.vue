<template>
  <div>
    <Ball :itemList="props.itemList" :revList="props.revList" ></Ball>
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
  a: string;
  b: string;
  tiCaiScore: string;
  extraScore: string;
  rev: number;
};


const props = defineProps<{ teamList: string[]; itemList: Item[]; revList: Rev[]; scoreRevList: Rev[]; }>();

// 总分
const oddsItemList = computed(() => {
  return props.itemList.filter(item => item.oddsTitle === '总分').map((item) => {
    return item.oddsItemList.map((odd) => {
      return {
        title: odd[0],
        win: parseFloat(odd[1]).toFixed(2),
        lose: parseFloat(odd[2]).toFixed(2),
      };
    });
  }).flat();
});
</script>
