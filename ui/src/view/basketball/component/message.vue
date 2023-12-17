<template>
  <List item-layout="horizontal" :data-source="props.message1List">
    <template #renderItem="{ item }">
      <div class="flex flex-wrap mb-2">
        <div v-for="(t, index) in sp(item)" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
          {{ t }}
        </div>
      </div>
    </template>
  </List>
</template>

<script setup lang="ts">
import { List } from 'ant-design-vue';
const props = defineProps<{
  message1List: string[];
}>();

const sp = (s: string) => {
  return s.split(' ');
};


const colors = [
  '#78a5de',
  '#4fb2a1',
  '#205a13',
  '#186174',
  '#88b00b',
  '#cf4b22',
  '#9e57cd',
  '#238910',
  '#c18fde',
  '#673b84',
  '#760bbb',
  '#557766',
  '#557733',
  '#337755',
];
</script>

<style scoped></style>
