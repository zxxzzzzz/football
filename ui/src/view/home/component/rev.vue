<template>
  <div>
    <Table :columns="columns" :dataSource="dataSource" :pagination="false"> </Table>
    <!-- <div>{{ dataSource }}</div> -->
  </div>
</template>
<script lang="ts" setup>
import { computed, h } from 'vue';
import { Table } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import Highlight from './highlight.vue';

const props = defineProps<{
  itemList: {
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
  return props.itemList
    // .slice(0, 1);
});
const columns: TableProps<typeof dataSource.value[0]>['columns'] = [
  {
    title: 'GC',
    dataIndex: 'gc',
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
    title: 'R',
    dataIndex: 'r',
    customRender({ record }) {
      return record.r.toFixed(2);
    },
  },
  {
    title: 'Rev',
    dataIndex: 'rev',
    customRender({ record }) {
      const revIndex = props.itemList.findIndex((r) => {
        return r.rev === record.rev && r.isMatch;
      });
      if (revIndex !== -1) {
        return h(Highlight, { content: record.rev.toFixed(2), index: revIndex });
      }
      return record.rev.toFixed(2);
    },
  },
];
</script>
