import { reactive } from 'vue';
import { message } from 'ant-design-vue';

const store = reactive({
  password: '',
  token: '',
  setting: {
    R: 0.12,
    A: 1,
    C: 0.13,
    Rev: 400,
    compareRev: 430,
    scoreRev: 200,
    halfRev: 400,
  },
});

const ps = localStorage.getItem('ps');
const token = localStorage.getItem('token');
if (ps) {
  store.password = ps;
}
if (token) {
  store.token = token;
}

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

getSetting();

export default store;
