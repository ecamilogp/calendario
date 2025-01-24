<script setup lang="ts">
import { ref, defineEmits, defineProps, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength, helpers } from '@vuelidate/validators';
import type { Reminderr } from '../interfaces/recordatorio';
import { QInput, QSelect } from 'quasar';
import { useReminderStore } from '../store/Reminder';
import axios from 'axios';

const reminderStore = useReminderStore();

type nombreDeCiudad =
  | 'Bogotá'
  | 'Medellín'
  | 'Cali'
  | 'Barranquilla'
  | 'Cartagena'
  | 'Cúcuta'
  | 'Bucaramanga'
  | 'Pereira'
  | 'Santa Marta';

const cordenadasDeCiudad: Record<
  nombreDeCiudad,
  { latitude: number; longitude: number }
> = {
  Bogotá: { latitude: 4.6105, longitude: -74.0817 },
  Medellín: { latitude: 6.2442, longitude: -75.5812 },
  Cali: { latitude: 3.4516, longitude: -76.532 },
  Barranquilla: { latitude: 10.9876, longitude: -74.802 },
  Cartagena: { latitude: 10.391, longitude: -75.4794 },
  Cúcuta: { latitude: 7.8932, longitude: -72.5078 },
  Bucaramanga: { latitude: 7.1193, longitude: -73.1213 },
  Pereira: { latitude: 4.8134, longitude: -75.6961 },
  'Santa Marta': { latitude: 11.2408, longitude: -74.199 },
};

const apiKey = '060f19ec2012466994469db36671163b';

const props = defineProps({
  recordatorioParaEditar: {
    type: Object as () => Reminderr | null,
    default: null,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const reminder = ref<Reminderr>(
  props.recordatorioParaEditar
    ? { ...props.recordatorioParaEditar }
    : {
        text: '',
        city: '',
        date: '',
        time: '',
        weather: '',
        color: '#79C0FF',
        id: 0,
      }
);

const crearReglas = {
  text: {
    required: helpers.withMessage('Este campo es requerido', required),
    maxLength: helpers.withMessage(
      'El máximo de caracteres es 30',
      maxLength(30)
    ),
  },
  city: {
    required: helpers.withMessage('Este campo es requerido', required),
  },
  date: {
    required: helpers.withMessage('Este campo es requerido', required),
  },
  time: {
    required: helpers.withMessage('Este campo es requerido', required),
  },
};

const v$ = useVuelidate(crearReglas, reminder.value);

function closeModal() {
  reminder.value = {
    text: '',
    city: '',
    date: '',
    time: '',
    weather: '',
    color: '#79C0FF',
    id: 0,
  };
  emit('cancel');
}

function guardarRecordatorio() {
  const reminderData: Reminderr = { ...reminder.value };
  v$.value.$touch();

  if (!v$.value.$invalid && reminderData) {
    emit('confirm', reminderData);
  } else {
    console.error('Datos del recordatorio inválidos');
    console.log(v$?.value?.$errors);
  }
}

function borrarRecordatorio() {
  if (props.recordatorioParaEditar) {
    reminderStore.eliminarRecordatorio(props.recordatorioParaEditar.id);
    closeModal();
  }
}

const buscarElClima = async () => {
  const cityName = reminder.value.city as nombreDeCiudad;
  const coordinates = cordenadasDeCiudad[cityName];

  if (coordinates) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: coordinates.latitude,
            lon: coordinates.longitude,
            appid: apiKey,
            units: 'metric',
            lang: 'es',
          },
        }
      );
      reminder.value.weather = response.data.weather[0].description;
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }
};

watch(() => reminder.value.city, buscarElClima);
</script>

<template>
  <div class="modal">
    <div class="modal-content">
      <h3>
        {{
          recordatorioParaEditar
            ? 'Editar Recordatorio'
            : 'Agregar Recordatorio'
        }}
      </h3>

      <q-input
        outlined
        v-model="reminder.text"
        label="Recordatorio"
        dense
        :error="v$?.text?.$dirty && v$?.text?.$invalid"
        :error-message="v$?.text?.$errors[0]?.$message.toString()"
      />
      <span class="char-count">{{ reminder.text.length }}/30</span>

      <q-select
        label="Ciudad"
        v-model="reminder.city"
        :options="Object.keys(cordenadasDeCiudad)"
        dense
        :error="v$?.city?.$dirty && v$?.city?.$invalid"
        :error-message="v$?.city?.$errors[0]?.$message.toString()"
        transition-show="flip-up"
        transition-hide="flip-down"
      />

      <q-input
        outlined
        v-model="reminder.date"
        label="Fecha"
        type="date"
        dense
        :error="v$?.date?.$dirty && v$?.date?.$invalid"
        :error-message="v$?.date?.$errors[0]?.$message.toString()"
      />

      <q-input
        outlined
        v-model="reminder.time"
        label="Hora"
        type="time"
        dense
        :error="v$?.time?.$dirty && v$?.time?.$invalid"
        :error-message="v$?.time?.$errors[0]?.$message.toString()"
      />

      <div class="color-picker">
        <input
          type="color"
          id="reminder-color"
          name="reminder-color"
          v-model="reminder.color"
        />
        <label for="reminder-color">Color</label>
      </div>

      <div class="button-group">
        <button @click="guardarRecordatorio" class="primary">
          {{ recordatorioParaEditar ? 'Guardar Cambios' : 'Agregar' }}
        </button>
        <button
          @click="closeModal"
          :class="['secondary', { gray: recordatorioParaEditar }]"
        >
          Cerrar
        </button>

        <button
          v-if="recordatorioParaEditar"
          @click="borrarRecordatorio"
          class="eliminar"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  max-height: 80%;

  display: flex;
  flex-direction: column;
}

.modal-content h3 {
  margin-bottom: 5px;
  text-align: center;
  color: #333;
}

.char-count {
  align-self: flex-end;
  font-size: 0.8em;
  color: #666;
}

.button-group {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  margin-top: 10px;
}

.button-group button {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.button-group .primary {
  background: #31a93b;
  color: white;
  text-shadow: 1px 1px 2px black;
}

.button-group .secondary {
  background: #e56f6f;
  color: white;
  text-shadow: 1px 1px 2px black;
}

.button-group .eliminar {
  background: #ff0000;
  color: white;
  text-shadow: 1px 1px 2px black;
}

.button-group button:hover {
  opacity: 0.9;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 5px;
}

.color-picker input[type='color'] {
  border: none;
  width: 50px;
  height: 50px;
  cursor: pointer;
}

h3 {
  font-size: x-large;
  font-weight: bold;
}

.button-group .secondary {
  background: #ff0000;
  color: white;
  text-shadow: 1px 1px 2px black;
}

.button-group .gray {
  background: #9e9e9e;
}
</style>
