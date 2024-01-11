import type { string } from 'yup'; import type { string } from 'yup';
<script lang="ts" setup>
defineProps<{
  name: string;
  icon: string;
  color: string;
}>();
</script>

<template>
  <UCard></UCard>
</template>
