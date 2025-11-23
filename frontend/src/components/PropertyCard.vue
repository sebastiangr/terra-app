<script setup>
  import { computed } from 'vue';
  import { BedDouble, Bath, Scaling, ExternalLink, MapPin } from 'lucide-vue-next';

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
  <div class="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300">

    <figure class="h-48 overflow-hidden relative group">
      <img 
        :src="property.main_image || 'https://placehold.co/600x400?text=Sin+Imagen'" 
        alt="Propiedad" 
        class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
        @error="onImageError"
      />
      <div class="absolute top-2 right-2 badge badge-secondary shadow-sm font-semibold opacity-90" v-if="property.source">
        {{ property.source }}
      </div>
    </figure>

    <div class="card-body p-5">
      
      <!-- Título -->
      <h2 class="card-title text-xl leading-snug line-clamp-2 min-h-12 text-base-content">
        {{ property.title || 'Propiedad sin título' }}
      </h2>

      <!-- Ubicación -->
      <p class="text-sm text-base-content/70 flex items-center gap-1.5 mt-1">
        <MapPin class="w-4 h-4 text-primary shrink-0" />
        <span class="truncate">{{ property.location || 'Ubicación desconocida' }}</span>
      </p>
      
      <!-- Badges de Características -->
      <div class="flex flex-wrap gap-2 my-3">
        <div v-if="features.bedrooms" class="badge badge-ghost badge-outline gap-1.5 pl-1.5 pr-2 text-base-content/80 border-base-content/20">
           <BedDouble class="w-3.5 h-3.5" /> 
           <span class="text-xs font-medium">{{ features.bedrooms }}</span>
        </div>
        <div v-if="features.bathrooms" class="badge badge-ghost badge-outline gap-1.5 pl-1.5 pr-2 text-base-content/80 border-base-content/20">
           <Bath class="w-3.5 h-3.5" /> 
           <span class="text-xs font-medium">{{ features.bathrooms }}</span>
        </div>
        <div v-if="features.area_total_m2" class="badge badge-ghost badge-outline gap-1.5 pl-1.5 pr-2 text-base-content/80 border-base-content/20">
           <Scaling class="w-3.5 h-3.5" /> 
           <span class="text-xs font-medium">{{ features.area_total_m2 }} m²</span>
        </div>
      </div>

      <div class="divider my-1 before:bg-base-content/10 after:bg-base-content/10"></div>

      <!-- Footer Card -->
      <div class="card-actions justify-between items-center">
        <div class="text-lg font-bold text-primary truncate">
          {{ formattedPrice }}
        </div>
        <a :href="property.url" target="_blank" class="btn btn-circle btn-sm btn-ghost hover:bg-base-content/10 text-base-content tooltip tooltip-left" data-tip="Ver Original">          
          <ExternalLink class="w-4 h-4" />
        </a>
      </div>

    </div>
  </div>
</template>