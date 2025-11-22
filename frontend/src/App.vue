<script setup>
  import { ref, onMounted } from 'vue';
  import PropertyCard from './components/PropertyCard.vue';
  import AddPropertyModal from './components/AddPropertyModal.vue';

  const properties = ref([]);
  const showModal = ref(false);
  const isLoading = ref(true);

  const fetchProperties = async () => {
    isLoading.value = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/properties`);
      if (res.ok) {
        properties.value = await res.json();
      }
    } catch (error) {
      console.error("Error cargando propiedades", error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchProperties);

</script>

<template>
  <div class="min-h-screen flex flex-col pb-10">
    
    <!-- Navbar simple -->
    <div class="navbar bg-base-100 shadow-sm px-4 md:px-8">
      <div class="flex-1">
        <a class="text-xl font-bold flex items-center gap-2 text-primary">
          🌍 Terra <span class="badge badge-sm badge-ghost font-normal">MVP</span>
        </a>
      </div>
      <div class="flex-none">
        <button @click="showModal = true" class="btn btn-primary btn-sm md:btn-md gap-2">
          <span class="hidden md:inline">Agregar Propiedad</span>
          <span class="md:hidden">+</span>
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <main class="container mx-auto px-4 mt-8 grow">
      
      <!-- Estado de Carga -->
      <div v-if="isLoading" class="flex justify-center mt-20">
        <span class="loading loading-dots loading-lg text-primary"></span>
      </div>

      <!-- VISTA 1: LISTADO (Dashboard) -->
      <div v-else-if="properties.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PropertyCard 
            v-for="prop in properties" 
            :key="prop.id" 
            :property="prop" 
          />
        </div>
      </div>

      <!-- VISTA 2: EMPTY STATE (Tu diseño original) -->
      <div v-else class="flex flex-col items-center justify-center mt-10 md:mt-20 text-center animate-fade-in">
        <div class="text-8xl mb-4 grayscale opacity-50">🌍</div>
        <h1 class="text-4xl md:text-5xl font-bold text-base-content">Bienvenido a Terra</h1>
        <p class="py-6 text-lg text-base-content/60 max-w-md mx-auto">
          No tienes propiedades guardadas aún.<br>
          Analiza tu primer enlace de MercadoLibre o Facebook.
        </p>
        <button @click="showModal = true" class="btn btn-primary btn-lg shadow-xl hover:scale-105 transition-transform">
          Comenzar Análisis
        </button>
      </div>

    </main>

    <!-- Modal (Siempre disponible) -->
    <AddPropertyModal 
      v-if="showModal" 
      @close="showModal = false" 
      @saved="fetchProperties" 
    />

  </div>
</template>

<!-- <template>
  <div class="flex items-center justify-center h-screen w-full">
    <div class="flex flex-col items-center justify-center max-w-md mx-auto">

        <div class="text-6xl mb-4">🌍</div>
        
        <h1 class="text-5xl font-bold text-primary">Terra</h1>
        <p class="py-6 text-lg text-base-content/80">
          Tu gestor inteligente de propiedades. <br>
          Analiza enlaces de MercadoLibre y Facebook con IA.
        </p>
        
        <div class="flex flex-col gap-4 items-center justify-center">

          <button class="btn btn-primary btn-lg shadow-lg">
            Comenzar Análisis
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
          
          <div class="badge badge-outline p-3">v1.0 MVP - Dockerized</div>
        </div>

    </div>
  </div>
</template> -->

<style>
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>