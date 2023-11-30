<template>
  <div>
    <div v-if="dataSource?.length">
      <div>让球</div>
      <Table :columns="columns" :dataSource="dataSource" :pagination="false"> </Table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { Table, message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import Highlight from './highlight.vue';

const props = defineProps<{
  revList: {
    isMatch: boolean;
    type: string;
    tiCaiOdds: number;
    extraOdds: number;
    tiCai: number;
    extra: number;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
  }[];
}>();
const dataSource = computed(() => {
  return props.revList;
  // .slice(0, 1);
});


const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
  {
    title: 'GC',
    dataIndex: 'GC',
    customRender({ record }) {
      return record.gc.toFixed(2);
    },
  },
  {
    title: 'VV',
    dataIndex: 'vv',
    customRender({ record }) {
      return record.vv.toFixed(2);
    },
  },
  {
    title: 'Offset',
    dataIndex: 'offset',
    customRender({ record }) {
      return record.offset.toFixed(2);
    },
  },
  {
    title: 'Rev',
    dataIndex: 'rev',
    customRender({ record }) {
      return record.rev.toFixed(2);
    },
  },
];


</script>
