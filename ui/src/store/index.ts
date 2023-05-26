import { reactive } from 'vue';

const store = reactive({
  password: '',
});

const ps = localStorage.getItem('ps');
if (ps) {
  store.password = ps;
}
export default store;