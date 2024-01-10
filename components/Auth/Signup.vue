<script lang="ts" setup>
import { object, string } from 'yup';

const schema = object({});

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  username: '',
  joincode: '',
});
</script>

<template>
  <div>
    <UForm :schema="schema" :state="form"></UForm>
  </div>
</template>
