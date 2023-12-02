<template>
  <div>
    <div v-if="dataSource?.length">
      <div>让球</div>
      <Table :columns="columns" :dataSource="dataSource" :pagination="false"> </Table>
    </div>
    <div v-if="scoreRevList?.length">
      <div>总分</div>
      <Table :columns="scoreColumns" :dataSource="scoreRevList" :pagination="false"> </Table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { Table, message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import Highlight from './highlight.vue';
import { Rev } from '../type';

const props = defineProps<{
  revList: Rev[];
  scoreRevList: Rev[];
}>();
const dataSource = computed(() => {
  return props.revList;
  // .slice(0, 1);
});
const scoreRevList = computed(() => {
  return props.scoreRevList;
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
    customRender({ record, index }) {
      return h(Highlight, { index: index, content: record.rev.toFixed(2) });
    },
  },
];
const scoreColumns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
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
    customRender({ record, index }) {
      return h(Highlight, { index: index + 4, content: record.rev.toFixed(2) });
    },
  },
];
</script>
../type