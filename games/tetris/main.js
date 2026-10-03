import { GameKit } from '../../lib/gamekit.js';
import { TetrisController } from './controller.js';

new TetrisController({ document, window, kit: GameKit });
