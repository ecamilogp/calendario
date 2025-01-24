<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import reminder from './reminder.vue';
import type { Reminderr } from '../interfaces/recordatorio.ts';
import { useReminderStore } from '../store/Reminder.ts';
import { storeToRefs } from 'pinia';

//esta variable maneja la fecha usando el objeto Date
const fechaActual = ref(new Date());
const openModal = ref(false);
const reminderStore = useReminderStore();
const { recordatorios } = storeToRefs(reminderStore);
const recordatorioParaEditar = ref<Reminderr | null>(null);

const diasDeLaSemana = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const mesesDelAño = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const nombreMesYAño = computed(() => {
  return `${
    mesesDelAño[fechaActual.value.getMonth()]
  } del ${fechaActual.value.getFullYear()}`;
});

const diasDelMes = computed(() => {
  const dias: (number | string)[] = [];
  const año = fechaActual.value.getFullYear();
  const mes = fechaActual.value.getMonth();
  const primerDiaMes = new Date(año, mes, 1);
  const primerDiaSemana = primerDiaMes.getDay();

  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push('');
  }

  const ultimoDiaMes = new Date(año, mes + 1, 0).getDate();
  for (let j = 1; j <= ultimoDiaMes; j++) {
    dias.push(j);
  }

  return dias;
});

const semanasDelMes = computed(() => {
  const semanas = [];
  let semana: (number | string)[] = [];

  for (let k = 0; k < diasDelMes.value.length; k++) {
    semana.push(diasDelMes.value[k]);
    if (semana.length === 7) {
      semanas.push(semana);
      semana = [];
    } else if (k === diasDelMes.value.length - 1) {
      semanas.push(semana);
    }
  }

  return semanas;
});

const cambioDeMesAdelante = () => {
  fechaActual.value.setMonth(fechaActual.value.getMonth() + 1);
  fechaActual.value = new Date(fechaActual.value);
};

const cambioDeMesAtras = () => {
  fechaActual.value.setMonth(fechaActual.value.getMonth() - 1);
  fechaActual.value = new Date(fechaActual.value);
};

const showModal = (recordatorio: Reminderr | null = null) => {
  recordatorioParaEditar.value = recordatorio;
  openModal.value = true;
};

const closeModal = () => {
  openModal.value = false;
  recordatorioParaEditar.value = null;
};

function hoy(dia: number | string) {
  const diaActual = new Date();
  return (
    dia === diaActual.getDate() &&
    fechaActual.value.getMonth() === diaActual.getMonth() &&
    fechaActual.value.getFullYear() === diaActual.getFullYear()
  );
}

const guardarRecordatorio = (nuevoRecordatorio: Reminderr) => {
  if (recordatorioParaEditar.value) {
    reminderStore.editarRecordatorio(nuevoRecordatorio);
  } else {
    reminderStore.crearRecordatorio(nuevoRecordatorio);
  }

  reminderStore.recordatorios.sort((a, b) => a.time.localeCompare(b.time));
  closeModal();
};

const formatearFecha = (fecha: Date): string => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const recordatoriosDelDia = computed(() => {
  return (dia: string | number) => {
    const date = new Date(
      fechaActual.value.getFullYear(),
      fechaActual.value.getMonth(),
      Number(dia)
    );
    const fechaFormateada = formatearFecha(date);
    return recordatorios.value.filter((recordatorio) => {
      const formatoDiferente = new Date(recordatorio.date.replaceAll('-', '/'));
      return formatearFecha(formatoDiferente) === fechaFormateada;
    });
  };
});

onBeforeMount(() => {
  reminderStore.recuperar();
});
</script>

<template>
  <div class="calendario">
    <div class="botones">
      <button class="direccion" @click="cambioDeMesAtras">◀︎</button>
      <h3>{{ nombreMesYAño }}</h3>
      <button class="direccion" @click="cambioDeMesAdelante">▶︎</button>
      <button class="reminders" @click="() => showModal(null)">
        Crear Recordatorio
      </button>
    </div>
    <table>
      <thead>
        <tr>
          <th v-for="dia in diasDeLaSemana" :key="dia">{{ dia }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(semana, indice) in semanasDelMes" :key="indice">
          <td
            v-for="(dia, index) in semana"
            :key="index"
            :class="{
              'dia-actual': hoy(dia),
            }"
          >
            {{ dia }}
            <div
              v-if="recordatoriosDelDia(dia).length > 0"
              class="recordatorios"
            >
              <div
                v-for="recordatorio in recordatoriosDelDia(dia)"
                :key="recordatorio.id"
                class="recordatorio"
                :style="{ background: recordatorio.color }"
                @click="() => showModal(recordatorio)"
              >
                <b>Recordatorio:</b> {{ recordatorio.text }} <br /><b
                  >Ciudad:</b
                >
                {{ recordatorio.city }} <br /><b>Fecha:</b>
                {{ recordatorio.date }} <br />
                <b>Hora:</b> {{ recordatorio.time }} <br />
                <b>clima:</b> {{ recordatorio.weather }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <reminder
      v-if="openModal"
      :recordatorioParaEditar="recordatorioParaEditar"
      @cancel="closeModal"
      @confirm="guardarRecordatorio"
    />
  </div>
</template>

<style scoped>
.calendario {
  display: flex;
  flex-direction: column;
  align-items: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  border: 2px solid #ddd;
  text-align: center;
  width: 84px;
  height: 84px;
  max-width: 84px;
  max-height: 84px;
  overflow: hidden;
  padding: 0;
  vertical-align: top;
}

td .dia {
  padding: 8px;
  box-sizing: border-box;
}

td .recordatorios {
  overflow: auto;
  max-height: 60px;
  width: 90%;
  padding-left: 10px;
}

.recordatorio {
  font-size: 11px;
  font-weight: bold;
  text-shadow: 0px 1px 1px rgb(0, 0, 0);
  color: #fbfafa;
  text-align: center;
  margin-bottom: 5px;
}
b {
  color: black;
  text-shadow: 0.8px 0px 1px white;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
}
th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.botones {
  display: flex;
  height: 120px;
}

.direccion {
  margin: 20px;
}

.reminders {
  width: 348px;
  margin: 20px;
}

.dia-actual {
  font-weight: bold;
  color: rgb(0, 0, 0);
  border-bottom: 2.4px solid rgba(141, 143, 144, 0.665);
  background: rgba(68, 68, 68, 0.113);
}

h3 {
  font-size: 35px;
  text-align: center;
}
</style>
