<script lang="ts" setup>
import type { YahtzeeGame, Player } from '~/types/custom';
import type { Database } from '~/types/database.types';

const props = defineProps<{
  game: YahtzeeGame;
}>();

const client = useSupabaseClient<Database>();

const gamemasterUsername = ref('');

const isGettingGamemasterUsername = ref(true);

const playerCount = computed(() => {
  if (!props.game || !props.game.players) {
    return 0;
  }

  return props.game.players.length;
});

async function getGamemasterUsername() {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', props.game.gamemaster)
    .single();

  if (error) {
    return 'Could not load gamemaster';
  }

  gamemasterUsername.value = data.username;

  isGettingGamemasterUsername.value = false;
}

watch(
  () => props.game,
  async () => {
    await getGamemasterUsername();
  },
  { immediate: true }
);
</script>

<template>
  <UCard class="min-w-[300px]">
    <div class="flex justify-between gap-6">
      <div class="space-y-2">
        <p class="font-bold text-lg">{{ game.room_name }}</p>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-user" />
          <p class="italic text-gray-400">@{{ gamemasterUsername }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-user-group" />
          <p>{{ playerCount }}</p>
        </div>
      </div>
      <UButton
        v-if="game.private"
        icon="i-heroicons-lock-closed"
        variant="soft"
        :to="`/yahtzee/${game.id}`"
        square
        >Join</UButton
      >
      <UButton v-else variant="soft" :to="`/yahtzee/${game.id}`" square
        >Join</UButton
      >
    </div>
  </UCard>
</template>
