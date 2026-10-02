import type { GameKitHooks, GameToPortalMessage, PortalToGameMessage } from './index.js';

describe('Protocole GameKit', () => {
  it('décrit les messages entrants et les hooks facultatifs', () => {
    const message: PortalToGameMessage = { type: 'preference', key: 'sound', value: false };
    let enabled = true;
    const hooks: GameKitHooks = { onSoundChange: value => { enabled = value; } };
    if (message.type === 'preference') {
      hooks.onSoundChange?.(message.value);
    }
    expect(enabled).toBe(false);
    const lifecycle: PortalToGameMessage[] = [
      { type: 'pause' }, { type: 'resume' }, { type: 'unload' },
    ];
    expect(lifecycle).toHaveLength(3);
  });

  it('décrit les messages sortants sans données fictives', () => {
    const messages: GameToPortalMessage[] = [
      { type: 'ready', game: 'test' },
      { type: 'score', game: 'test', score: 42 },
      { type: 'quit', game: null },
    ];
    expect(messages.map(message => message.type)).toEqual(['ready', 'score', 'quit']);
  });
});

// Vérifiés par tsc, pas seulement par la transpilation Jest.
// @ts-expect-error La préférence de son est un booléen.
const invalidPreference: PortalToGameMessage = { type: 'preference', key: 'sound', value: 'false' };
// @ts-expect-error Un score sortant est obligatoire.
const invalidScore: GameToPortalMessage = { type: 'score', game: 'test' };
void invalidPreference;
void invalidScore;
