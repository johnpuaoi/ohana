<script lang="ts" setup>
const items = [
  {
    key: 'login',
    label: 'Login',
  },
  {
    key: 'signup',
    label: 'Sign up',
  },
];
</script>

<template>
  <div>
    <UTabs :items="items">
      <template #item="{ item }">
        <div class="mt-8">
          <AuthLogin v-if="item.key === 'login'" />
          <AuthSignup v-else />
        </div>
      </template>
    </UTabs>
  </div>
</template>
