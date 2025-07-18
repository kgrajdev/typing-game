// AchievementsScene.ts
import {Scene} from "phaser";
import {fadeOutScene} from "../utils/scene-switcher";
import {initialiseScene} from "../utils/initialise-scene";
import SoundManager from "../utils/sound-manager";
import {createBackButton} from "../utils/scene-return-button";
import LocalStorageManager from "../utils/local-storage-manager";
import {createImageText} from "../utils/create-text";


interface Achievement {
    unlockedAt: number;
    name: string;
    description: string;
}

type AchievementMap = {
    [key: string]: Achievement;
};

export class AchievementsScene extends Scene {
    currentTheme: string = 'A'
    private localStorage: LocalStorageManager;
    gameState = {
        achievements: {} as AchievementMap
    };
    
    constructor() {
        super('AchievementsScene');
    }

    create() {
        initialiseScene(this);
        this.currentTheme = this.registry.get('tile-theme');
        const soundManager = SoundManager.getInstance();
        this.localStorage = new LocalStorageManager();
        
        // Try to load previous state
        const savedState = this.localStorage.load();
        if (savedState) {
            this.gameState = { ...this.gameState, ...savedState };
        }
        
        createBackButton(this, () => {
            soundManager.playClickSound();
            this.goToMainMenu();
        }, this.currentTheme);


        // const unlockedColor = 0x00ff00; // green
        // const lockedColor = 0xff0000;   // red
        const { width } = this.scale;
        let startY = 140; // vertical starting point
        const lineSpacing = 32;

        // Sort achievement keys alphabetically (optional)
        const achievementKeys = Object.keys(this.gameState.achievements);
        // const achievementKeys = Object.keys(this.gameState.achievements).sort();

        achievementKeys.forEach((key, index) => {
            const achievement = this.gameState.achievements[key];
            // const isUnlocked = achievement.unlockedAt > 0;

            // const color = isUnlocked ? unlockedColor : lockedColor;
            // const statusEmoji = isUnlocked ? 'Y' : 'N';

            // Title
            // createImageText(
            //     this,
            //     `${statusEmoji} ${achievement.name}`,
            //     width / 2,
            //     startY + index * lineSpacing * 2,
            //     0.3,
            //     this.currentTheme,
            //     true,
            //     false,
            //     color
            // );
            // titleText.setTint(color);

            // Description
            createImageText(
                this,
                achievement.description,
                width / 2,
                startY + index * lineSpacing * 2 ,
                0.20,
                this.currentTheme,
                true,
                false
            );
            // descriptionText.setTint(0xffffff); // White text
        });
        console.table(this.gameState.achievements);
    }

    private goToMainMenu() {
        fadeOutScene('MainMenuScene', this);
    }
}