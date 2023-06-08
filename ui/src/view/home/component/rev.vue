<template>
  <div>
    <div v-if="dataSource?.length">
      <div>胜平负</div>
      <Table :columns="columns" :dataSource="dataSource" :pagination="false"> </Table>
    </div>
    <div v-if="scoreDataSource?.length">
      <div class="mt-4">得分</div>
      <Table :columns="scoreColumns" :dataSource="scoreDataSource" :pagination="false"> </Table>
    </div>
    <div v-if="halfDataSource?.length">
      <div class="mt-4">半场</div>
      <Table :columns="halfColumns" :dataSource="halfDataSource" :pagination="false"> </Table>
    </div>
    <!-- <div>{{ dataSource }}</div> -->
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue';
import { Table, message } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';
import Highlight from './highlight.vue';
import store from '@/store/index';

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
  scoreItemList: {
    tiCaiOdds: number;
    extraOdds: number;
    tiCai: string;
    extra: string;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
  }[];
  halfItemList: {
    tiCaiOdds: number;
    extraOdds: number;
    tiCai: string;
    extra: string;
    rev: number;
    gc: number;
    vv: number;
    r: number;
    offset: number;
  }[];
}>();
const dataSource = computed(() => {
  return props.itemList;
  // .slice(0, 1);
});
const scoreDataSource = computed(() => {
  return props.scoreItemList;
  // .slice(0, 1);
});
const halfDataSource = computed(() => {
  return props.halfItemList;
  // .slice(0, 1);
});


const columns: TableProps<(typeof dataSource.value)[0]>['columns'] = [
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
      if (revIndex !== -1 && record.rev >= store.setting.Rev) {
        return h(Highlight, { content: record.rev.toFixed(2), index: revIndex });
      }
      return record.rev.toFixed(2);
    },
  },
];
const scoreColumns: TableProps<(typeof scoreDataSource.value)[0]>['columns'] = [
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
    customRender({ record, index }) {
      const isRev = record.rev >= store.setting.scoreRev;
      return h(Highlight, { content: record.rev.toFixed(2), index: isRev ? index + 2 : -1 });
    },
  },
];
const halfColumns: TableProps<(typeof halfDataSource.value)[0]>['columns'] = [
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
    customRender({ record, index }) {
      const isRev = record.rev >= store.setting.halfRev;
      return h(Highlight, { content: record.rev.toFixed(2), index: isRev ? index + 4 : -1 });
    },
  },
];
</script>
