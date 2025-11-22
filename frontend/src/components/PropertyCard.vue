<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    property: Object
  });

  // Formatear precio a COP
  const formattedPrice = computed(() => {
    if (!props.property.price) return 'A consultar';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: props.property.currency || 'COP',
      maximumFractionDigits: 0 
    }).format(props.property.price);
  });

  const features = computed(() => {
    return props.property.ai_data?.features || {};
  });

  const onImageError = (e) => {
    e.target.src = "https://placehold.co/600x400?text=No+Image";
  };
</script>

<template>
  <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
    <figure class="h-48 overflow-hidden relative">
      <img 
        :src="property.main_image || 'https://placehold.co/600x400?text=Sin+Imagen'" 
        alt="Propiedad" 
        class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
        @error="onImageError"
      />
      <div class="absolute top-2 right-2 badge badge-secondary" v-if="property.source">
        {{ property.source }}
      </div>
    </figure>
    <div class="card-body p-4">
      <h2 class="card-title text-lg leading-tight">
        {{ property.title || 'Propiedad sin título' }}
      </h2>
      <p class="text-sm text-gray-500 flex items-center gap-1">
        📍 {{ property.location || 'Ubicación desconocida' }}
      </p>
      
      <div class="flex gap-2 my-2 text-xs">
        <div v-if="features.bedrooms" class="badge badge-outline gap-1">
           🛏️ {{ features.bedrooms }}
        </div>
        <div v-if="features.bathrooms" class="badge badge-outline gap-1">
           🚿 {{ features.bathrooms }}
        </div>
        <div v-if="features.area_total_m2" class="badge badge-outline gap-1">
           📐 {{ features.area_total_m2 }} m²
        </div>
      </div>

      <div class="card-actions justify-between items-center mt-2">
        <div class="text-xl font-bold text-primary">
          {{ formattedPrice }}
        </div>
        <a :href="property.url" target="_blank" class="btn btn-sm btn-ghost">Ver Link</a>
      </div>
    </div>
  </div>
</template>