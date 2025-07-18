// SettingsScene.ts
import {Scene} from "phaser";
import {fadeOutScene} from "../utils/scene-switcher";
import {initialiseScene} from "../utils/initialise-scene";
import SoundManager from "../utils/sound-manager";
import {createBackButton} from "../utils/scene-return-button";

export class SettingsScene extends Scene {
    currentTheme: string = 'A'
    
    constructor() {
        super('SettingsScene');
    }

    create() {
        initialiseScene(this);
        this.currentTheme = this.registry.get('tile-theme')
        const soundManager = SoundManager.getInstance();

        createBackButton(this, () => {
            soundManager.playClickSound();
            this.goToMainMenu();
        }, this.currentTheme);
        
    }

    private goToMainMenu() {
        fadeOutScene('MainMenuScene', this);
    }
}