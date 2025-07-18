// PauseScene.ts
import Phaser from 'phaser';
import {createImageText} from "../utils/create-text";
import {checkWordFitmentOnScreen} from "../utils/tile-scaling";
import SoundManager from "../utils/sound-manager";

export default class PauseScene extends Phaser.Scene {
    currentTheme: string = 'A'
    constructor() {
        super('PauseScene');
    }

    create(data: { onResume?: () => void } = {}) {
        const { width, height } = this.scale;
        this.currentTheme = this.registry.get('tile-theme');
        const soundManager = SoundManager.getInstance();
        
        // Semi-transparent overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.9)
            .setOrigin(0)
            .setDepth(9);

        // Resume button
        const resumeButton = createImageText(this, 'Resume', width/2, height/2, checkWordFitmentOnScreen(this, 'resume'), this.currentTheme, true, true);
        resumeButton.setDepth(10);
        resumeButton.on('pointerdown', () => {
            soundManager.playClickSound();
            this.scene.stop();                    // Stop PauseScene
            this.scene.resume('GameScene');       // Resume GameScene
            if (data.onResume) {
                data.onResume();                  // Call the resume callback
            }
        }).on('pointerover', () => {
            resumeButton.setAlpha(0.80);
        }).on('pointerout', () => {
            resumeButton.setAlpha(1);
        });
    }
}
