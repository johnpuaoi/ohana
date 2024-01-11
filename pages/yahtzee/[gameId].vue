<script lang="ts" setup>
import { useRoute } from 'vue-router';

const { params } = useRoute();
</script>

<template>
  <div>{{ params.gameId }}</div>
</template>
