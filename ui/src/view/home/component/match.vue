<template>
  <div>
    <!-- <div class="mb-2">{{ weekDay }}</div> -->
    <div class="mb-2">{{ props?.num }}</div>
    <div class="mb-2">{{ props?.dateTime }}</div>
    <div class="mb-2">{{ props?.leagueName }}</div>
    <div class="flex mb-2">
      <div class="mr-2">{{ props?.tiCaiTeamList?.[0] }}</div>
      <div>{{ props?.tiCaiTeamList?.[1] }}</div>
    </div>
    <div class="flex mb-2 text-green-500">
      <div class="mr-2">{{ props?.extraTeamList?.[0] }}</div>
      <div>{{ props?.extraTeamList?.[1] }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
const props = defineProps<{ dateTime: string; leagueName: string; tiCaiTeamList: string[]; num: string; extraTeamList: string[] }>();

const weekDay = computed(() => {
  if (!props.dateTime) {
    return '';
  }
  try {
    const m = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const d = dayjs(props.dateTime, 'YYYY-MM-DD HH:mm').day();
    return m[d];
  } catch (error: any) {
    return error.message;
  }
});
</script>
