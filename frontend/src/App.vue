<script setup>
  import { ref, onMounted } from 'vue';
  import { Globe, Plus, Sun, Moon } from 'lucide-vue-next';
  import PropertyCard from './components/PropertyCard.vue';
  import AddPropertyModal from './components/AddPropertyModal.vue';

  const properties = ref([]);
  const showModal = ref(false);
  const isLoading = ref(true);

  const theme = ref('cmyk'); // Default light

  const toggleTheme = () => {
    theme.value = theme.value === 'cmyk' ? 'dim' : 'cmyk';
    applyTheme();
  };

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value);
    localStorage.setItem('user-theme', theme.value);
  };

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

  
  onMounted(() => {  
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme) theme.value = savedTheme;
    applyTheme();
    
    fetchProperties();
  });


</script>

<template>
  <div class="min-h-screen flex flex-col pb-10 transition-colors duration-300">
    
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-sm px-4 md:px-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div class="w-full flex flex-row justify-between">
        <a class="text-xl font-bold flex items-center gap-2 text-primary cursor-pointer hover:opacity-80" @click="fetchProperties">
          <Globe class="w-6 h-6" /> <!-- Icono Lucide -->
          Terra <span class="badge badge-xs badge-ghost font-normal">v0.0.2</span>
        </a>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <!-- Botón Agregar -->
        <button @click="showModal = true" class="btn btn-primary btn-sm md:btn-md gap-2 shadow-md">
          <span class="hidden md:inline">Agregar Propiedad</span>
          <Plus class="w-5 h-5" /> <!-- Icono Lucide -->
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <main class="w-full mx-auto px-8 mt-8 grow">
      
      <!-- Loading  -->
      <div v-if="isLoading" class="flex justify-center mt-20">
        <span class="loading loading-dots loading-lg text-primary"></span>
      </div>

      <!-- Dashboard  -->
      <div v-else-if="properties.length > 0" class="animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <PropertyCard 
            v-for="prop in properties" 
            :key="prop.id" 
            :property="prop" 
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center mt-10 md:mt-20 text-center animate-fade-in">
        <div class="mb-6 p-6 bg-base-300 rounded-full bg-opacity-30">
           <Globe class="w-24 h-24 text-primary opacity-80" stroke-width="1" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-base-content">Bienvenido a Terra</h1>
        <p class="py-6 text-lg text-base-content/60 max-w-md mx-auto">
          Tu portafolio inmobiliario inteligente.<br>
          Analiza tu primer enlace de MercadoLibre o Facebook.
        </p>
        <button @click="showModal = true" class="btn btn-primary btn-lg shadow-xl hover:scale-105 transition-transform gap-3">
          <Plus class="w-6 h-6" />
          Comenzar Análisis
        </button>
      </div>

    </main>
    
    <!-- Botón Toggle Tema -->
    <div class="fixed bottom-0 left-0 z-10">
      <div class="bg-base-100 shadow-md rounded-full mb-4 ml-4">
        <button @click="toggleTheme" class="btn btn-circle btn-ghost hover:bg-base-content/10 text-base-content">
          <Sun v-if="theme === 'cmyk'"/>
          <Moon v-else />
        </button>
      </div>
    </div>

    <!-- Modal -->
    <AddPropertyModal 
      v-if="showModal" 
      @close="showModal = false" 
      @saved="fetchProperties" 
    />

  </div>
</template>

<style>
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>