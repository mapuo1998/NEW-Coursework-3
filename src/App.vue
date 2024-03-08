<!-- App.vue -->
<template>
  <div>
      <ParentComponent />
  </div>
</template>

<script>
import ParentComponent from './components/ParentComponent.vue';

export default {
  components: {
      ParentComponent
  }
};
</script>
