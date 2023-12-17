<template>
  <Drawer width="840" placement="right" :closable="true" :visible="_drawerVisible" :mask="true" @close="onClose">
    <List item-layout="horizontal" :data-source="message1List">
      <template #renderItem="{ item }">
        <div class="flex flex-wrap mb-2">
          <div v-for="(t, index) in sp(item)" :style="{ color: colors[index], margin: '0 4px' }" class="whitespace-nowrap">
            {{ t }}
          </div>
        </div>
      </template>
    </List>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Drawer, List } from 'ant-design-vue';
const props = defineProps<{
  message1List: string[];
  drawerVisible: boolean;
}>();

const _drawerVisible = ref(false);
const sp = (s: string) => {
  return s.split(' ');
};
const onClose = () => {
  _drawerVisible.value = false;
};

watch(
  () => props.drawerVisible,
  () => {
    _drawerVisible.value = props.drawerVisible;
    console.log(_drawerVisible.value, '_drawerVisible.value');
  },
  { immediate: true }
);

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
