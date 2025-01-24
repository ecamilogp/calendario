import { defineStore } from 'pinia';
import type { Reminderr } from '../interfaces/recordatorio';

export const useReminderStore = defineStore('recordatorio', {
  state: () => ({
    recordatorios: [] as Reminderr[],
  }),
  actions: {
    guardar() {
      const save = JSON.stringify(this.recordatorios);
      localStorage.setItem('recordatorio', save);
    },
    recuperar() {
      const GR = localStorage.getItem('recordatorio');
      this.recordatorios = GR ? (JSON.parse(GR) as Reminderr[]) : [];
    },
    crearRecordatorio(data: Reminderr) {
      if (data) {
        data.id = Math.floor(Math.random() * 200);
        this.recordatorios.push(data);
      } else {
        console.error('El recordatorio recibido es undefined o null');
      }
      this.guardar();
    },

    editarRecordatorio(data: Reminderr) {
      const index = this.recordatorios.findIndex((r) => r.id === data.id);
      if (index !== -1) {
        this.recordatorios.splice(index, 1, data);
      }
      this.guardar();
    },

    eliminarRecordatorio(id: number) {
      this.recordatorios = this.recordatorios.filter((r) => r.id !== id);
      this.guardar();
    },
  },
});
