// utils/sound-manager.ts
import Phaser from 'phaser';

export default class SoundManager {
    private static instance: SoundManager;
    private scene: Phaser.Scene;

    private clickSound!: Phaser.Sound.BaseSound;
    private typeSound!: Phaser.Sound.BaseSound;
    private errorSound!: Phaser.Sound.BaseSound;
    private gameOverSound!: Phaser.Sound.BaseSound;
    private wordCompleteSound!: Phaser.Sound.BaseSound;
    private achievementUnlockedSound!: Phaser.Sound.BaseSound;
    private static backgroundMusic: Phaser.Sound.BaseSound | null = null;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initSounds();
    }

    public static init(scene: Phaser.Scene): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager(scene);
        }
        return SoundManager.instance;
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            throw new Error('SoundManager has not been initialized. Call SoundManager.init(scene) first.');
        }
        return SoundManager.instance;
    }

    private initSounds() {
        this.clickSound = this.scene.sound.add('selectSound', { volume: 0.33 });
        this.typeSound = this.scene.sound.add('typeSound', { volume: 0.5 });
        this.errorSound = this.scene.sound.add('errorSound', { volume: 0.5 });
        this.wordCompleteSound = this.scene.sound.add('wordCompleteSound', { volume: 0.33 });
        this.gameOverSound = this.scene.sound.add('gameOverSound', { loop: false, volume: 0.5 });
        this.achievementUnlockedSound = this.scene.sound.add('achievementUnlocked', { loop: false, volume: 0.5 });

        if (!SoundManager.backgroundMusic) {
            SoundManager.backgroundMusic = this.scene.sound.add('bgMusic', { loop: true, volume: 0.33 });
        }
    }

    playBackgroundMusic(): void {
        if (SoundManager.backgroundMusic && !SoundManager.backgroundMusic.isPlaying) {
            SoundManager.backgroundMusic.play();
        }
    }

    stopBackgroundMusic(): void {
        if (SoundManager.backgroundMusic && SoundManager.backgroundMusic.isPlaying) {
            SoundManager.backgroundMusic.stop();
        }
    }

    playClickSound(): void {
        this.clickSound.play();
    }

    playTypeSound(): void {
        this.typeSound.play();
    }

    playWordCompleteSound(): void {
        this.wordCompleteSound.play();
    }

    playErrorSound(): void {
        this.errorSound.play();
    }

    playGameOverSound(): void {
        this.gameOverSound.play();
    }
    
    playAchievementUnlockedSound(): void {
        this.achievementUnlockedSound.play();
    }

    stopGameOverSound(): void {
        this.gameOverSound.stop();
    }

    muteAll(): void {
        this.scene.sound.mute = true;
    }

    unmuteAll(): void {
        this.scene.sound.mute = false;
    }
}
