<template>
  <div>
    <Ball :revList="props.revList" :itemList="ballItemList" class="flex-1"></Ball>
    <div v-for="item in itemListSort">
      <div class="mr-4 mb-2">{{ item.oddsTitle }}</div>
      <div class="flex mr-4 mb-2" v-for="oddItem in item.oddsItemList">
        <div class="mr-1" v-for="(str, index) in oddItem">
          <div v-if="index === 0">{{ str }}</div>
          <Tag v-else>{{ str }}</Tag>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Tag } from 'ant-design-vue';
import { computed } from 'vue';
import Ball from './ball.vue';
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
const props = withDefaults(defineProps<{ teamList: string[]; itemList: Item[]; revList: Rev[] }>(), {
  teamList: () => ['', ''],
  revList: () => [],
  itemList: () => [{ oddsTitle: '', oddsItemList: [] }],
});
const itemListSort = computed(() => {
  return props.itemList.filter((a) => a.oddsTitle !== '让球' && a.oddsTitle !== '独赢');
});
const ballItemList = computed(() => {
  return props.itemList.filter((a) => a.oddsTitle === '让球' || a.oddsTitle === '独赢');
});
</script>
