<template>
  <div>
    <Ball :revList="props.revList" :halfRevList="props.halfRevList" :itemList="ballItemList" class="flex-1"></Ball>
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

const scoreItemList = computed(() => {
  return props.itemList
    .filter((a) => a.oddsTitle === '得分')
    .map((item) => {
      return {
        title: item.oddsTitle,
        itemList: item.oddsItemList
          .map((oddsItem) => {
            const index = props.scoreRevList.findIndex((s) => oddsItem[0] === s.extra && parseFloat(oddsItem[1]) === s.extraOdds);
            return {
              index: index === -1 ? -1 : index + 2,
              content: oddsItem,
            };
          })
          .filter((d): d is Exclude<typeof d, undefined> => !!d),
      };
    });
});
const ballItemList = computed(() => {
  return props.itemList.filter((a) => a.oddsTitle === '让球' || a.oddsTitle === '独赢');
});
</script>
