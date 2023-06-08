<template>
  <div class="pt-12 px-4">
    <div class="flex mb-4">
      <div class="w-[13rem] text-right mr-2">R</div>
      <Input v-model:value="store.setting.R"></Input>
    </div>
    <div class="flex mb-4">
      <div class="w-[13rem] text-right mr-2">A</div>
      <Input v-model:value="store.setting.A"></Input>
    </div>
    <div class="flex mb-4">
      <div class="w-[13rem] text-right mr-2">C</div>
      <Input v-model:value="store.setting.C"></Input>
    </div>
    <div class="flex mb-4">
      <div class="whitespace-nowrap w-[13rem] text-right mr-2">胜平负Rev</div>
      <Input v-model:value="store.setting.Rev"></Input>
    </div>
    <div class="flex mb-4">
      <div class="whitespace-nowrap w-[13rem] text-right mr-2">两场比赛比较的Rev</div>
      <Input v-model:value="store.setting.compareRev"></Input>
    </div>
    <div class="flex mb-4">
      <div class="whitespace-nowrap w-[13rem] text-right mr-2">得分Rev</div>
      <Input v-model:value="store.setting.scoreRev"></Input>
    </div>
    <div class="flex mb-4">
      <div class="whitespace-nowrap w-[13rem] text-right mr-2">半场Rev</div>
      <Input v-model:value="store.setting.halfRev"></Input>
    </div>
    <div class="flex mb-4 justify-end">
      <Button @click="handleBack" class="mr-4"> 返回数据页 </Button>
      <Button @click="handleSave"> 保存 </Button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Input, message, Button } from 'ant-design-vue';
import { computed, h, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import store from "@/store/index";

const router = useRouter();



async function getSetting() {
  const origin = import.meta.env.DEV ? 'http://127.0.0.1:9000' : location.origin;
  let res: Response | undefined = void 0;
  try {
    res = await fetch(`${origin}/setting`);
  } catch (error) {
    // @ts-ignore
    message.error(error.message);
  }
  if (res) {
    const d = await res.json();
    if (d.code === 200) {
      store.setting = {
        ...d.data,
      };
    }
    if (d.code !== 200) {
      message.error(d.msg);
    }
  }
}
type Setting = typeof store.setting;
async function setSetting(setting: Setting) {
  const origin = import.meta.env.DEV ? 'http://127.0.0.1:9000' : location.origin;
  const res = await fetch(`${origin}/setting`, {
    method: 'post',
    body: JSON.stringify(setting),
    headers: { 'content-type': 'application/json' },
  });
  const d = await res.json();
  if (d.code === 200) {
    // message.success(d.msg);
  }
  if (d.code !== 200) {
    message.error(d.msg);
  }
}
const handleBack = () => {
  router.push({ path: '/home' });
};
const handleSave = async () => {
  const m = {
    R: 'R',
    A: 'A',
    C: 'C',
    Rev: '胜平负Rev',
    compareRev: '两场比赛比较的Rev',
    scoreRev: '得分Rev',
    halfRev: '半场Rev',
  };
  type Keys = keyof typeof store.setting;
  const isValid = Object.keys(store.setting).every((k) => {
    const v = store.setting[k as Keys];
    const n = parseFloat(`${v}`);
    if (Number.isNaN(n)) {
      message.error(m[k as Keys] + '填写的非法值，无法保存', 10);
      return false;
    }
    return true;
  });
  if (isValid) {
    const _setting = Object.keys(store.setting).reduce((re, k) => {
      const v = store.setting[k as Keys];
      const n = parseFloat(`${v}`);
      return { ...re, [k]: n };
    }, {} as Setting);
    await setSetting(_setting);
    message.success('设置更新成功');
    await getSetting();
  }
};

onMounted(async () => {
  await getSetting();
});
</script>
