import {Scene} from "phaser";
import {fadeOutScene} from "../utils/scene-switcher";
import LocalStorageManager from "../utils/local-storage-manager";


export class PreloadScene extends Scene {
    // themeList = ["A","B","C","D","E","F","G","I","J"];
    themeList = ["G"];
    localStorageManager = new LocalStorageManager();
    
    constructor() {
        super('PreloadScene');
    }

    init(){
        if (!this.localStorageManager.isLocalStorageAvailable()) return;
    }
    
    preload() {
        const { width, height } = this.cameras.main;

        // Background bar (static)
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 25, width / 2, 50);

        // Progress bar (dynamic)
        const progressBar = this.add.graphics();
        
        // --- Event Listeners ---
        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 15, (width / 2 - 20) * value, 30);
            // percentText.setText(`${Math.floor(value * 100)}%`);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });
        
        this.load.json('words', 'assets/words.json');
        
        let misc = ["check","coin","cross","cursor","directionEast","directionNorth","directionSouth","directionWest","dollar",
                            "dot1","dot2","dot3","dot4","dot5","dot6","euro","heart","minus","percent","plus","skull","star","warning"];
        this.themeList.forEach((style) => {
            
            // preload letters
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                this.load.image(`${letter}_Style${style}`, `assets/letters/Style${style}/tile${letter}.png`);
            }
            // space
            this.load.image(`_Style${style}`, `assets/letters/Style${style}/tile.png`);
            
            // preload numbers
            for (let i = 0; i <= 9; i++) {
                this.load.image(`${i}_Style${style}`, `assets/letters/Style${style}/tile${i}.png`);
            }  
            
            // preload misc
            misc.forEach((misc) => {
                this.load.image(`${misc}_Style${style}`, `assets/letters/Style${style}/tile_${misc}.png`);
            })
        })
        
        // preload audio
        this.load.audio('bgMusic', 'assets/audio/Drumming-Sticks.ogg');
        this.load.audio('selectSound', 'assets/audio/confirmation_003.ogg');
        this.load.audio('typeSound', 'assets/audio/click_001.ogg');
        this.load.audio('wordCompleteSound', 'assets/audio/confirmation_002.ogg');
        this.load.audio('errorSound', 'assets/audio/error_005.ogg');
        this.load.audio('gameOverSound', 'assets/audio/jingles-saxophone_13.ogg');
        this.load.audio('achievementUnlocked', 'assets/audio/jingles-retro_08.ogg');
        this.load.audio('powerBoostTriggered', 'assets/audio/jingles-retro_00.ogg');
        
        // preload other imagery
        this.load.image('preload-bg', 'assets/word-rush-logo.png');
        this.load.image('game-bg', 'assets/backgrounds/backgroundCastles.png');
    }

    create(): void {
        const width = this.scale.width;
        const height = this.scale.height;
        this.add.image(width/2, height/2, 'preload-bg').setOrigin(0.5).setDepth(1);

        // === randomly select theme
        const randomTheme = this.themeList[Math.floor(Math.random() * this.themeList.length)];
        this.registry.set('tile-theme', randomTheme);
        
        this.time.delayedCall(1000, this.loadMainMenuScene, [], this);
    }
    loadMainMenuScene(){
        fadeOutScene('MainMenuScene', this)
    }
    
}