<template>
  <div>
    <div v-for="item in oddsItemList">
      <div class="flex">
        <div class="w-4rem h-1.5rem">{{ item.title }}</div>
        <div class="w-5rem h-1.5rem" v-for="el in item.item">
          {{ el }}
        </div>

      </div>
    </div>
    <!-- <Ball :revList="props.revList" :halfRevList="props.halfRevList" :itemList="ballItemList" class="flex-1"></Ball> -->
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

const oddsItemList = computed(() => {
  return props.itemList.map((item) => {
    return item.oddsItemList.map((odd) => {
      return {
        title: item.oddsTitle,
        item: odd,
      };
    });
  }).flat();
});
</script>
