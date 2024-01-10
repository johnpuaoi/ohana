<script lang="ts" setup>
import { object, string } from 'yup';
import type { Database } from '~/types/database.types';

const client = useSupabaseClient<Database>();

const loginForm = ref();

const loginError = ref<string | null>(null);

const isLoggingIn = ref(false);

const showPassword = ref(false);

const schema = object({
  email: string().email().required('Please enter your email.'),
  password: string().required('Please enter your password.'),
});

const form = reactive({
  email: '',
  password: '',
});

const hasEmptyFields = computed(() => {
  if (!form.email) return true;
  if (!form.password) return true;
  return false;
});

const isAbleToSubmit = computed(() => {
  if (!loginForm.value) return null;

  if (loginForm.value.errors.length > 0) return false;

  if (hasEmptyFields.value) return false;

  return true;
});

const inputType = computed(() => {
  if (showPassword.value) {
    return 'text';
  }

  return 'password';
});

const passwordVisibilityIcon = computed(() => {
  if (showPassword.value) {
    return 'i-heroicons-eye-slash';
  }

  return 'i-heroicons-eye';
});

async function login() {
  if (!isAbleToSubmit.value) return;

  // Reset login error
  loginError.value = null;

  // Set loading
  isLoggingIn.value = true;

  const { error } = await client.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  });

  if (error) {
    loginError.value = error.message;
    isLoggingIn.value = false;
    return;
  }

  isLoggingIn.value = false;
}

function togglePassVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div>
    <UForm :schema="schema" :state="form" ref="loginForm" class="space-y-4">
      <UFormGroup label="Email" size="lg">
        <UInput
          v-model="form.email"
          placeholder="Your email"
          :disabled="isLoggingIn"
        />
      </UFormGroup>
      <UFormGroup label="Password" size="lg">
        <UInput
          v-model="form.password"
          placeholder="Your password"
          :type="inputType"
          :disabled="isLoggingIn"
        />
        <UButton
          @click="togglePassVisibility"
          variant="ghost"
          :icon="passwordVisibilityIcon"
          square
        />
      </UFormGroup>
      <UButton
        @click="login"
        size="lg"
        block
        :disabled="!isAbleToSubmit"
        :loading="isLoggingIn"
        >Login</UButton
      >
    </UForm>

    <UAlert
      v-if="loginError"
      title="Error Logging In"
      :description="loginError"
      color="red"
      variant="subtle"
      icon="i-heroicons-exclamation-triangle"
    />
  </div>
</template>
