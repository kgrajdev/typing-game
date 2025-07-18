import { AUTO, Game, Types, Scale } from 'phaser';
import {PreloadScene} from "./scenes/PreloadScene";
import {GameOverScene} from "./scenes/GameOverScene";
import {MainMenuScene} from "./scenes/MainMenuScene";
import {GameScene} from "./scenes/GameScene";
import {SettingsScene} from "./scenes/SettingsScene";
import {AchievementsScene} from "./scenes/AchievementsScene";
import {HighScoresScene} from "./scenes/HighScoresScene";
import PauseScene from "./scenes/PauseScene";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#101010',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.WIDTH_CONTROLS_HEIGHT
    },
    scene: [
        PreloadScene,
        MainMenuScene,
        GameScene,
        GameOverScene,
        SettingsScene,
        AchievementsScene,
        HighScoresScene,
        PauseScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // optional
            gravity: {
                y: 0,
                x: 0
            }
        }
    },
    pixelArt: true
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
