import type { Database } from './database.types';

export type Player = Database['public']['Tables']['profiles']['Row'];

export type PlayerShushers =
  Database['public']['Tables']['player_total_shushers']['Row'];

export type YahtzeeGame = Database['public']['Tables']['yahtzee_games']['Row'];

export type YahtzeeScorecards =
  Database['public']['Tables']['yahtzee_scorecards']['Row'];
