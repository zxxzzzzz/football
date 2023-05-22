<template>
  <div :style="{ background: color }" class="text-white p-1">
    {{ props.content }}
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
const colorList = [
  'hsl(0, 100%, 50%)',
  'hsl(10, 80%, 10%)',
  'hsl(20, 50%, 50%)',
  'rgb(20,200,20)',
  'rgb(40,40,250)',
  'rgb(200,10,160)',
  'hsl(60,70%, 40%)',
  'hsl(100,80%, 20%)',
  'hsl(190, 90%, 50%)',
  'hsl(270, 100%, 40%)',
];
const props = defineProps<{ content: string | number; index: number | number[] }>();
const color = computed(() => {
  if (Array.isArray(props.index)) {
    const indexList = props.index;
    // linear-gradient(to bottom left, cyan 50%, palegoldenrod 50%)
    return (
      'linear-gradient(to right,' +
      props.index
        .map((i, index) => `${colorList[i]} ${(index * 100) / indexList.length}% ${((index + 1) * 100) / indexList.length}%`)
        .join(',') +
      ')'
    );
  }
  return colorList[props.index] || 'red';
});
</script>
