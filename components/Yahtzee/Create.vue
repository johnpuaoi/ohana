<script lang="ts" setup>
import { boolean, object, string } from 'yup';

const { add: addNotification } = useToast();

const user = useSupabaseUser();

const isCreateModalOpen = ref(false);

const createForm = ref();

const isCreatingGame = ref(false);

const createGameError = ref<string | null>(null);

const form = reactive({
  room_name: '',
  private: false,
  join_code: null,
});

const schema = object({
  room_name: string().required(),
  private: boolean().required(),
  join_code: string().when('private', {
    is: true,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

const isAbleToCreate = computed(() => {
  if (!createForm.value) return false;

  if (!form.room_name) return false;

  if (form.private && !form.join_code) return false;

  if (createForm.value.errors.length > 0) return false;

  return true;
});

async function createGame() {
  if (!isAbleToCreate.value) return;

  createGameError.value = null;

  isCreatingGame.value = true;

  const { data, error } = await useFetch('/api/yahtzee/create', {
    body: {
      gamemaster: user.value?.id,
      room_name: form.room_name,
      private: form.private,
      join_code: form.join_code,
    },
    method: 'POST',
    headers: useRequestHeaders(['cookie']),
  });

  if (error.value) {
    createGameError.value;
    isCreatingGame.value = false;
    return;
  }

  addNotification({
    title: `Room ${form.room_name} Created`,
    color: 'green',
    icon: 'i-heroicons-check-circle',
  });

  await navigateTo(`/yahtzee/${data.value}`);
}

function openCreateModal() {
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
}
</script>

<template>
  <div>
    <UButton @click="openCreateModal" icon="i-heroicons-plus" color="gray"
      >Create a gameroom</UButton
    >

    <UModal v-model="isCreateModalOpen" @close="closeCreateModal">
      <UCard>
        <UForm
          :state="form"
          :schema="schema"
          ref="createForm"
          class="space-y-4"
        >
          <UFormGroup
            label="Room Name"
            help="This will help others find your room."
          >
            <UInput v-model="form.room_name" :disabled="isCreatingGame" />
          </UFormGroup>
          <UFormGroup label="Do you want this game to be private?">
            <UToggle v-model="form.private" :disabled="isCreatingGame" />
          </UFormGroup>
          <UFormGroup
            v-if="form.private"
            label="Join code"
            help="This is the code others will need to use to enter the game."
          >
            <!-- @vue-expect-error -->
            <UInput v-model="form.join_code" :disabled="isCreatingGame" />
          </UFormGroup>
          <UButton
            @click="createGame"
            :disabled="!isAbleToCreate || isCreatingGame"
            :loading="isCreatingGame"
            block
            >Create game</UButton
          >
        </UForm>

        <UAlert
          v-if="createGameError"
          title="Error creating game"
          :description="createGameError"
        />
      </UCard>
    </UModal>
  </div>
</template>
