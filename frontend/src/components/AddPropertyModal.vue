<script setup>
  import { ref, reactive } from 'vue';

  const emit = defineEmits(['close', 'saved']);

  const step = ref('input'); // input | loading | review
  const urlInput = ref('');
  const errorMessage = ref('');

  const formData = reactive({
    original_url: '',
    title: '',
    price: null,
    currency: 'COP',
    location: '',
    description: '',
    scraped_image: '',
    features: { bedrooms: null, bathrooms: null, area_total_m2: null },
    type: ''
  });

  const analyzeUrl = async () => {
    if (!urlInput.value) return;
    
    step.value = 'loading';
    errorMessage.value = '';

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-code': import.meta.env.VITE_ACCESS_CODE
        },
        body: JSON.stringify({ url: urlInput.value })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      Object.assign(formData, {
        original_url: data.original_url,
        title: data.title,
        price: data.price,
        currency: data.currency || 'COP',
        location: data.location,
        description: data.description || data.sentiment?.cons[0] || '',
        scraped_image: data.scraped_image,
        features: data.features || {},
        type: data.type
      });

      step.value = 'review';

    } catch (error) {
      errorMessage.value = error.message;
      step.value = 'input';
    }
  };

  const saveProperty = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-code': import.meta.env.VITE_ACCESS_CODE
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        emit('saved');
        emit('close');
        resetModal();
      } else {
        alert("Error al guardar");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const resetModal = () => {
    step.value = 'input';
    urlInput.value = '';
    errorMessage.value = '';
  };
</script>

<template>
  <dialog class="modal modal-open bg-black/50 backdrop-blur-sm">
    <div class="modal-box w-11/12 max-w-3xl">
      <button @click="$emit('close')" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      
      <!-- PASO 1: INPUT URL -->
      <div v-if="step === 'input'" class="py-4 text-center">
        <h3 class="font-bold text-2xl mb-4">Agregar Nueva Propiedad</h3>
        <input 
          v-model="urlInput" 
          type="text" 
          placeholder="Pega el enlace de MercadoLibre o Facebook aquí..." 
          class="input input-bordered w-full mb-4"
          @keyup.enter="analyzeUrl"
        />
        <p v-if="errorMessage" class="text-error mb-4">{{ errorMessage }}</p>
        <button @click="analyzeUrl" class="btn btn-primary w-full">
          Analizar con IA 🤖
        </button>
      </div>

      <!-- PASO 2: LOADING -->
      <div v-if="step === 'loading'" class="py-10 text-center flex flex-col items-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4 text-lg animate-pulse">Analizando metadatos y extrayendo información...</p>
      </div>

      <!-- PASO 3: REVISIÓN Y EDICIÓN -->
      <div v-if="step === 'review'" class="py-2">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          📝 Revisa los datos extraídos
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Columna Izq: Imagen -->
          <div>
            <img :src="formData.scraped_image || 'https://placehold.co/600x400'" class="rounded-lg shadow-md w-full h-48 object-cover mb-2">
            <input v-model="formData.scraped_image" type="text" class="input input-xs input-bordered w-full" placeholder="URL Imagen">
          </div>

          <!-- Columna Der: Datos Principales -->
          <div class="space-y-2">
            <div class="form-control">
              <label class="label"><span class="label-text">Título</span></label>
              <input v-model="formData.title" type="text" class="input input-bordered input-sm w-full" />
            </div>
            <div class="flex gap-2">
              <div class="form-control w-1/2">
                <label class="label"><span class="label-text">Precio</span></label>
                <input v-model="formData.price" type="number" class="input input-bordered input-sm w-full" />
              </div>
              <div class="form-control w-1/2">
                <label class="label"><span class="label-text">Ubicación</span></label>
                <input v-model="formData.location" type="text" class="input input-bordered input-sm w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Detalles Técnicos -->
        <div class="divider text-xs">Características</div>
        <div class="flex gap-2">
           <input v-model="formData.features.bedrooms" type="number" placeholder="Hab" class="input input-bordered input-sm w-1/3" />
           <input v-model="formData.features.bathrooms" type="number" placeholder="Baños" class="input input-bordered input-sm w-1/3" />
           <input v-model="formData.features.area_total_m2" type="number" placeholder="Área m²" class="input input-bordered input-sm w-1/3" />
        </div>

        <div class="modal-action mt-6">
           <button @click="step = 'input'" class="btn btn-ghost">Atrás</button>
           <button @click="saveProperty" class="btn btn-success text-white">Guardar Propiedad</button>
        </div>
      </div>
    </div>
  </dialog>
</template>