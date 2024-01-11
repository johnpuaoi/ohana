<script lang="ts" setup>
import type { Player, YahtzeeGame } from '~/types/custom';
import type { Database } from '~/types/database.types';

const client = useSupabaseClient<Database>();

const yahtzeeGames = ref<YahtzeeGame[] | null>(null);

const yahtzeeGamesChannel = client.channel('joinable_yahtzee_games').on(
  'postgres_changes',
  {
    event: '*',
    schema: 'public',
    table: 'yahtzee_games',
    filter: 'has_started=eq.false',
  },
  async () => {
    await getYahtzeeGames();
  }
);

const gamesError = ref<string | null>(null);

const isGettingGames = ref<boolean>(false);

async function getYahtzeeGames() {
  gamesError.value = null;

  const { data, error } = await client
    .from('yahtzee_games')
    .select('*')
    .eq('has_started', false)
    .order('created_at');

  if (error) {
    gamesError.value = error.message;
    isGettingGames.value = false;
  }

  yahtzeeGames.value = data;
}

onMounted(async () => {
  isGettingGames.value = true;
  await getYahtzeeGames();
  yahtzeeGamesChannel.subscribe();
});

onBeforeUnmount(async () => {
  await yahtzeeGamesChannel.unsubscribe();
});
</script>

<template>
  <div class="overflow-y-auto max-h-[400px] space-y-6">
    <YahtzeeGame v-for="game in yahtzeeGames" :key="game.id" :game="game" />
  </div>
</template>
