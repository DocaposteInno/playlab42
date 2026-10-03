/**
 * Protocole ESM du SDK et du portail, sans imposer TypeScript aux jeux.
 */
export type PortalToGameMessage =
  | { type: 'unload' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'preference'; key: 'sound'; value: boolean };

/**
 * Messages émis par le SDK. quit reste utilisable avant init.
 */
export type GameToPortalMessage =
  | { type: 'ready'; game: string }
  | { type: 'score'; game: string; score: number }
  | { type: 'quit'; game: string | null };

/**
 * Hooks facultatifs installés par le client de jeu sur window.
 */
export interface GameKitHooks {
  onGameDispose?: () => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
  onSoundChange?: (enabled: boolean) => void;
}
