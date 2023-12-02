<template>
  <div>
    <Ball :itemList="props.itemList" :revList="props.revList" ></Ball>
    <div class="flex">
      <div v-for="item in oddsItemList" class="mr-1.5rem">
        <div >总分：{{ item.title }}</div>
        <div class="flex">
          胜&nbsp;&nbsp;&nbsp;：
          <Highlight
            v-if="
              props.scoreRevList?.[0]?.extraType === 'win' &&
              props.scoreRevList?.[0]?.extraScore === item.title &&
              parseFloat(props.scoreRevList?.[0]?.b) === item.win
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
              props.scoreRevList?.[0]?.extraType === 'lose' &&
              props.scoreRevList?.[0]?.extraScore === item.title &&
              parseFloat(props.scoreRevList?.[0]?.b) === item.lose
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
import { Tag } from 'ant-design-vue';
import { computed } from 'vue';
import Ball from './ball.vue';
import Highlight from './highlight.vue';
import { Rev } from '../type';
interface Item {
  oddsTitle: string;
  oddsItemList: string[][];
}



const props = defineProps<{ teamList: string[]; itemList: Item[]; revList: Rev[]; scoreRevList: Rev[]; }>();

// 总分
const oddsItemList = computed(() => {
  return props.itemList.filter(item => item.oddsTitle === '总分').map((item) => {
    return item.oddsItemList.map((odd) => {
      return {
        title: odd[0],
        win: parseFloat(odd[1]),
        lose: parseFloat(odd[2]),
      };
    });
  }).flat();
});
</script>
../type