import {Scene} from "phaser";
import {createImageText} from "../utils/create-text";
import {fadeOutScene} from "../utils/scene-switcher";
import {initialiseScene} from "../utils/initialise-scene";
import {checkWordFitmentOnScreen} from "../utils/tile-scaling";
import SoundManager from "../utils/sound-manager";
import {createBackButton} from "../utils/scene-return-button";

export class GameOverScene extends Scene {
    currentTheme: string = 'A'
    
    constructor() {
        super('GameOverScene');
    }

    create(data: { score: number, highScore: number }) {
        const {width, height} = initialiseScene(this);
        this.currentTheme = this.registry.get('tile-theme')
        const soundManager = SoundManager.getInstance();
        
        const sceneHeading1 = createImageText(this, "Game", width/2, height/4, checkWordFitmentOnScreen(this, 'game'), this.currentTheme,true, false)
        createImageText(this, "Over", sceneHeading1.x+96, sceneHeading1.y+64, checkWordFitmentOnScreen(this, 'over'), this.currentTheme,true, false)


        // score
        createImageText(this, `Score`, width/2, height/2.5, checkWordFitmentOnScreen(this, 'score'), this.currentTheme,true, false)
        createImageText(this, String(data.score), width/2, height/2.15, checkWordFitmentOnScreen(this, String(data.score)), this.currentTheme,true, false)

        
        // highscore
        createImageText(this, `HighScore`, width/2, height/1.75, checkWordFitmentOnScreen(this, 'highscore'), this.currentTheme,true, false)
        createImageText(this, String(data.highScore), width/2, height/1.55, checkWordFitmentOnScreen(this, String(data.highScore)), this.currentTheme,true, false)


        createBackButton(this, () => {
            soundManager.playClickSound();
            this.goToMainMenu();
        }, this.currentTheme);
        
    }

    private goToMainMenu() {
        fadeOutScene('MainMenuScene', this);
    }
    
}