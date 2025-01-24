import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const myApp = createApp(App);

myApp.use(createPinia());
myApp.mount('#app');
