import {Scene} from "phaser";
import { createImageText } from '../utils/create-text';
import {fadeOutScene} from "../utils/scene-switcher";
import {initialiseScene} from "../utils/initialise-scene";
import SoundManager from "../utils/sound-manager";

export class MainMenuScene extends Scene {
    spaceBar: Phaser.Input.Keyboard.Key;
    currentTheme: string = 'A'
    declare registry: Phaser.Data.DataManager;
    soundManager: SoundManager;
    
    constructor() {
        super('MainMenuScene');
    }

    create(): void {
        const {width, height} = initialiseScene(this);
        this.currentTheme = this.registry.get('tile-theme')
        this.soundManager = SoundManager.init(this); // initializes & stores instance
        this.soundManager.playBackgroundMusic();
        
        let mainMenuItemsScale: number = 1;
        if (width > 768) {
            mainMenuItemsScale = 0.4;
        } else if (width <= 768 && width > 521) {
            mainMenuItemsScale = 0.3;
        } else if (width <= 521) {
            mainMenuItemsScale = 0.2;
        }
        
        // ==== START
        const startButton = createImageText(this, "Start", width/2, height/2, mainMenuItemsScale, this.currentTheme, true, true);
        startButton.on('pointerdown', () => {
            this.soundManager.playClickSound();
            this.openScene('GameScene');
        }).on('pointerover', () => {
            startButton.setAlpha(0.80);
        }).on('pointerout', () => {
            startButton.setAlpha(1);
        });

        // ==== SETTINGS
        const settingsButton = createImageText(this, "SETTINGS", width/2, startButton.y+startButton.height+96, mainMenuItemsScale, this.currentTheme, true, true)
            .setVisible(false);
        settingsButton.on('pointerdown', () => {
            this.soundManager.playClickSound();
            this.openScene('SettingsScene');
        }).on('pointerover', () => {
            settingsButton.setAlpha(0.80);
        }).on('pointerout', () => {
            settingsButton.setAlpha(1);
        });
        
        // ==== ACHIEVES
        const achievementsButton = createImageText(this, "ACHIEVEMENTS", width/2, startButton.y+startButton.height+96, mainMenuItemsScale, this.currentTheme, true, true);
        achievementsButton.on('pointerdown', () => {
            this.soundManager.playClickSound();
            this.openScene('AchievementsScene');
        }).on('pointerover', () => {
            achievementsButton.setAlpha(0.80);
        }).on('pointerout', () => {
            achievementsButton.setAlpha(1);
        });
        
        // ==== ACHIEVES
        const highScoresButton = createImageText(this, "HIGHSCORES", width/2, achievementsButton.y+achievementsButton.height+96, mainMenuItemsScale, this.currentTheme, true, true)
            .setVisible(false);
        highScoresButton.on('pointerdown', () => {
            this.soundManager.playClickSound();
            this.openScene('HighScoresScene');
        }).on('pointerover', () => {
            highScoresButton.setAlpha(0.80);
        }).on('pointerout', () => {
            highScoresButton.setAlpha(1);
        });
    }

    private openScene(sceneName: string) {
        fadeOutScene(sceneName, this);
    }
    
}