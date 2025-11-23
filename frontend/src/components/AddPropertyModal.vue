<script setup>
  import { ref, reactive } from 'vue';
  import { X, Bot, Loader2, Check, Link2, Home, DollarSign, MapPin as MapIcon } from 'lucide-vue-next';

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
  <dialog class="modal modal-open bg-black/60 backdrop-blur-sm z-50">
    <div class="modal-box w-11/12 max-w-3xl p-0 overflow-hidden shadow-2xl">
      
      <!-- Header del Modal -->
      <div class="bg-base-200 px-6 py-4 flex justify-between items-center border-b border-base-300">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <span v-if="step === 'input'">Nueva Propiedad</span>
          <span v-else-if="step === 'loading'">Analizando...</span>
          <span v-else>Revisión de Datos</span>
        </h3>
        <button @click="$emit('close')" class="btn btn-sm btn-circle btn-ghost">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="p-6">
        <!-- PASO 1: INPUT URL -->
        <div v-if="step === 'input'" class="py-4 text-center">
          <div class="mb-6 relative w-full max-w-lg mx-auto">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link2 class="text-base-content/50 w-5 h-5" />
            </div>
            <input 
              v-model="urlInput" 
              type="text" 
              placeholder="Pega el enlace de MercadoLibre o Facebook..." 
              class="input input-bordered w-full pl-10 input-lg shadow-sm focus:input-primary transition-all"
              @keyup.enter="analyzeUrl"
            />
          </div>
          
          <p v-if="errorMessage" class="text-error mb-4 bg-error/10 p-2 rounded-lg text-sm">{{ errorMessage }}</p>
          
          <button @click="analyzeUrl" class="btn btn-primary btn-lg w-full max-w-xs gap-2 shadow-md">
            <Bot class="w-5 h-5" />
            Analizar con IA
          </button>
        </div>

        <!-- PASO 2: LOADING -->
        <div v-if="step === 'loading'" class="py-12 text-center flex flex-col items-center">
          <Loader2 class="w-16 h-16 text-primary animate-spin mb-4" />
          <p class="text-lg font-medium animate-pulse">Nuestra IA está leyendo la página...</p>
          <p class="text-sm text-base-content/60 mt-2">Esto toma unos segundos</p>
        </div>

        <!-- PASO 3: REVISIÓN -->
        <div v-if="step === 'review'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Columna Izq: Imagen -->
            <div class="flex flex-col gap-2">
              <div class="relative group rounded-xl overflow-hidden shadow-md bg-base-200 h-48 md:h-full max-h-64">
                 <img :src="formData.scraped_image || 'https://placehold.co/600x400'" class="w-full h-full object-cover">
                 <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-white text-sm font-bold">Vista Previa</span>
                 </div>
              </div>
              <input v-model="formData.scraped_image" type="text" class="input input-xs input-bordered w-full text-center" placeholder="URL de la imagen">
            </div>

            <!-- Columna Der: Datos -->
            <div class="space-y-3">
              <div class="form-control">
                <label class="label py-1"><span class="label-text flex items-center gap-1"><Home class="w-3 h-3"/> Título</span></label>
                <input v-model="formData.title" type="text" class="input input-bordered input-sm w-full font-bold" />
              </div>
              
              <div class="flex gap-3">
                <div class="form-control w-1/2">
                  <label class="label py-1"><span class="label-text flex items-center gap-1"><DollarSign class="w-3 h-3"/> Precio</span></label>
                  <input v-model="formData.price" type="number" class="input input-bordered input-sm w-full" />
                </div>
                <div class="form-control w-1/2">
                   <label class="label py-1"><span class="label-text flex items-center gap-1"><MapIcon class="w-3 h-3"/> Ubicación</span></label>
                   <input v-model="formData.location" type="text" class="input input-bordered input-sm w-full" />
                </div>
              </div>

              <div class="divider text-xs my-1 font-semibold text-base-content/50">DETALLES</div>

              <div class="grid grid-cols-3 gap-2">
                 <div class="form-control">
                    <label class="label py-0 text-xs text-center block mb-1">Habitaciones</label>
                    <input v-model="formData.features.bedrooms" type="number" class="input input-bordered input-sm w-full text-center" />
                 </div>
                 <div class="form-control">
                    <label class="label py-0 text-xs text-center block mb-1">Baños</label>
                    <input v-model="formData.features.bathrooms" type="number" class="input input-bordered input-sm w-full text-center" />
                 </div>
                 <div class="form-control">
                    <label class="label py-0 text-xs text-center block mb-1">Área (m²)</label>
                    <input v-model="formData.features.area_total_m2" type="number" class="input input-bordered input-sm w-full text-center" />
                 </div>
              </div>
            </div>
          </div>

          <div class="modal-action mt-8 border-t border-base-200 pt-4">
             <button @click="step = 'input'" class="btn btn-ghost">Cancelar</button>
             <button @click="saveProperty" class="btn btn-success text-white gap-2 px-6">
                <Check class="w-4 h-4" /> Guardar Propiedad
             </button>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>