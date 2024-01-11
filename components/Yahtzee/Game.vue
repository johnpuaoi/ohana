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

  return props.game.players.length + 1;
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
  }
);
</script>

<template>
  <UCard :key="game.id" class="prose flex gap-4 max-w-[300px]">
    <div>
      <p>{{ game.room_name }}</p>
      <p>{{ gamemasterUsername }}</p>
      <p>{{ playerCount }}</p>
      <span v-if="game.private" class="flex items-center gap-2"
        ><UIcon name="i-heroicons-lock-closed" />Private</span
      >
    </div>

    <UButton :to="`/yahtzee/${game.id}`" square>Join</UButton>
  </UCard>
</template>
