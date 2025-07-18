// Game.ts
import { Scene } from 'phaser';
import {createDynamicImageText, createImageText} from "../utils/create-text";
import {initialiseScene} from "../utils/initialise-scene";
import {checkWordFitmentOnScreen} from "../utils/tile-scaling";
import SoundManager from "../utils/sound-manager";
import LocalStorageManager from "../utils/local-storage-manager";
import HealthManager from "../utils/health-manager";
import NotificationManager from "../utils/notification-manager";
import PowerManager from "../utils/power-manager";

interface Config {
    fullPoints: number;
    penalties: {
        wrongLetter: number;
        timeout: number;
    };
    timeLimit: number;
}

const config: Config = {
    fullPoints: 10,
    penalties: { // points to remove
        wrongLetter: 1,
        timeout: 5,
    },
    timeLimit: 1000*10, // 10 seconds
};
interface Achievement {
    unlockedAt: number;
    name: string;
    description: string;
}

type AchievementMap = {
    [key: string]: Achievement;
};
interface AchievementDefinition {
    name: string;
    description: string;
}

export class GameScene extends Scene {
    words: string[] = [];
    currentWord: string = '';
    currentIndex = 0;
    score = 0;
    correctWords = 0;
    timer!: Phaser.GameObjects.Graphics;
    timerBarWidth = 1;
    timerBarHeight = 30;
    letterImages: Phaser.GameObjects.Image[] = [];
    startTime!: number;
    tileScale: number;
    currentTheme: string = 'A'
    soundManager: SoundManager;
    declare registry: Phaser.Data.DataManager;
    gameState = {
        currentPoints: 0,
        highScore: 0,

        // session-only
        wordsCompleted: 0,
        mistakesDone: 0,

        // persistent
        totalWordsCompleted: 0,
        totalMistakesDone: 0,
        totalPoints: 0,

        lastSaved: Date.now(),
        achievements: {} as AchievementMap
    };
    localStorage!: LocalStorageManager;
    scoreDigits: Phaser.GameObjects.Image[] = [];
    highScoreDigits: Phaser.GameObjects.Image[] = [];
    isPlaying = false;
    healthManager!: HealthManager;
    private currentScoreLabel: Phaser.GameObjects.Container;
    private currentHighScoreLabel: Phaser.GameObjects.Container;
    achievementDefinitions: Record<string, AchievementDefinition> = {
        wordsTotal50: {
            name: 'x',
            description: '50 Words Across Games',
        },
        wordsSession50: {
            name: 'x',
            description: '50 Words in a Game',
        },
        wordsTotal150: {
            name: 'x',
            description: '150 Words Across Games',
        },
        wordsSession25: {
            name: 'x',
            description: '25 Words in a Game',
        },
        totalMistakes30: {
            name: 'xt',
            description: '30 Mistakes Across Games',
        },
        highScore100: {
            name: 'x',
            description: 'Get 100 Points in a Game',
        },
        totalScore1500: {
            name: 'x',
            description: 'Get 1500 Points Across Games',
        },
        fallStart: {
            name: 'x',
            description: 'Fail at the first word.',
        }
    };
   
    private notifier: NotificationManager;
    paused = false;
    timerEvent!: Phaser.Time.TimerEvent;  // Phaser timer event for countdown
    inputEnabled = false;
    private powerManager!: PowerManager;
    
    constructor() {
        super('GameScene');
    }
    create() {
        initialiseScene(this);
        this.currentTheme = this.registry.get('tile-theme')
        this.soundManager = SoundManager.getInstance();
        this.localStorage = new LocalStorageManager();
        
        NotificationManager.init(this); // once per scene
        this.notifier = NotificationManager.getInstance();

        // Load persistent state (if exists)
        const savedState = this.localStorage.load();
        if (savedState) {
            this.gameState = { ...this.gameState, ...savedState };
        }

        // Reset session-only state
        this.resetSessionStats();

        // Shuffle and prepare words set
        this.words = Phaser.Utils.Array.Shuffle(this.cache.json.get('words'));
        
        // Game Start Setup
        this.createTimerBar();
        this.createTimerEvent();

        this.startInitialCountdown(() => {
            this.inputEnabled = true;
            this.timerBarWidth = this.cameras.main.width;
            this.powerManager = new PowerManager(this);
            
            this.spawnWord();
            this.createScoreDisplayHeadings();
            this.createPauseButton();
            this.updateCurrentScoreDisplay(String(this.score), String(this.gameState.highScore));

            // Initialize health
            this.healthManager = new HealthManager(this, 3, 3, this.currentTheme);
            this.healthManager.initHealth();

            this.localStorage.save(this.gameState);  // Save right at the start
            this.timerEvent.paused = false; // Start timer
        });

        // setup keyboard input
        this.input.keyboard?.on('keydown', this.handleKeyboardInput.bind(this));

    }
    private handleKeyboardInput(e: KeyboardEvent) {
        if (!this.inputEnabled) return;
        if (!this.isPlaying || this.timerEvent.paused) return;
        const typed = e.key.toUpperCase();

        if (!/^[A-Z]$/.test(typed)) return;
        if (!this.currentWord) return;

        this.soundManager.playTypeSound();
        const expected = this.currentWord[this.currentIndex].toUpperCase();

        if (typed === expected) {
            this.letterImages[this.currentIndex].setTint(0x00ff00);
            this.currentIndex++;

            if (this.currentIndex >= this.currentWord.length) {
                this.isPlaying = false;
                this.timerEvent.paused = true;

                this.soundManager.playWordCompleteSound();
                const pts = this.calculatePointsToAward();
                this.score += pts;
                this.gameState.totalPoints += pts;
                this.updateCurrentScoreDisplay(String(this.score), String(this.gameState.highScore));

                this.powerManager.increasePower(pts);
                
                this.gameState.wordsCompleted++;
                this.gameState.totalWordsCompleted++;

                this.gameState.currentPoints = this.score;
                this.gameState.lastSaved = Date.now();
                this.localStorage.save(this.gameState);
                this.checkAchievements();

                const midX = this.cameras.main.width / 2;
                const midY = this.cameras.main.height / 2 - 100;
                this.showPointsFeedback(pts, true, midX, midY, () => {
                    this.spawnWord();
                });
            }
        } else {
            this.score -= config.penalties.wrongLetter;
            this.gameState.mistakesDone++;
            this.gameState.totalMistakesDone++;
            this.gameState.currentPoints = this.score;
            this.gameState.lastSaved = Date.now();
            this.localStorage.save(this.gameState);
            this.checkAchievements();

            this.soundManager.playErrorSound();

            this.powerManager.decreasePower();
            
            this.updateCurrentScoreDisplay(String(this.score), String(this.gameState.highScore));
            this.cameras.main.shake(100, 0.01);

            const midX = this.cameras.main.width / 2;
            const midY = this.cameras.main.height / 2 - 100;
            this.showPointsFeedback(config.penalties.wrongLetter, false, midX, midY, () => {});

            this.healthManager.decreaseHealth();
        }
    }

    unlockAchievement(id: string) {
        if (!this.gameState.achievements[id]) {
            const def = this.achievementDefinitions[id];
            if (!def) return;

            this.gameState.achievements[id] = {
                unlockedAt: Date.now(),
                name: def.name,
                description: def.description,
            };

            this.soundManager.playAchievementUnlockedSound();
            this.notifier.showNotification('Achievement Unlocked');
            this.localStorage.save(this.gameState);
        }
    }
    checkAchievements() {
        // number of words across multiple games 1
        if (this.gameState.totalWordsCompleted === 50) {
            this.unlockAchievement('wordsTotal50');
        }
        
        // number of words in a single game 2
        if (this.gameState.wordsCompleted >= 50) {
            this.unlockAchievement('wordsSession50');
        }
        
        // number of words in a single game 1
        if (this.gameState.wordsCompleted === 25) {
            this.unlockAchievement('wordsSession25');
        }

        // number of words across multiple games 2
        if (this.gameState.totalWordsCompleted >= 150) {
            this.unlockAchievement('wordsTotal150');
        }

        // score in a single game
        if (this.score >= 100) {
            this.unlockAchievement('highScore100');
        }
        
        // score across multiple games
        if (this.gameState.totalPoints >= 1500) {
            this.unlockAchievement('totalScore1500');
        }

        // number of mistakes across multiple games 1
        if (this.gameState.totalMistakesDone >= 10) {
            this.unlockAchievement('totalMistakes30');
        }
        // no words and already mistakes
        if (this.gameState.wordsCompleted === 0 && this.gameState.totalMistakesDone > 0) {
            this.unlockAchievement('fallStart');
        }
    }
    
    resetSessionStats() {
        this.score = 0;
        this.correctWords = 0;
        this.currentIndex = 0;
        this.currentWord = '';
        this.letterImages = [];
        this.startTime = 0;

        // Reset session-only stats
        this.gameState.wordsCompleted = 0;
        this.gameState.mistakesDone = 0;
        this.gameState.currentPoints = 0;
    }

    /**
     * Initial Game Countdown
     * @param onComplete
     */
    startInitialCountdown(onComplete: () => void) {
        const countdownNumbers = ['3', '2', '1'];
        let index = 0;

        const { width, height } = this.cameras.main;

        const countdown = createDynamicImageText(this, countdownNumbers[index], width / 2, height / 2, 1, this.currentTheme, true);
        const countdownContainer = countdown.container;

        const countdownEvent = this.time.addEvent({
            delay: 500,
            repeat: countdownNumbers.length - 1,
            callback: () => {
                index++;

                // If finished, remove and start game
                if (index >= countdownNumbers.length) {
                    countdownContainer.destroy();
                    countdownEvent.destroy();
                    onComplete(); // Start game
                    return;
                }

                // Update countdown text
                countdown.setText(countdownNumbers[index]);
            }
        });
    }


    /**
     * Helper to check how fast user completed the word
     * @private
     */
    private calculatePointsToAward(): number {
        const remaining = this.timerEvent?.getRemaining?.() ?? 0;
        const percentRemaining = remaining / config.timeLimit;

        let points = 1;

        if (percentRemaining >= 0.9) points = 10;
        else if (percentRemaining >= 0.7) points = 8;
        else if (percentRemaining >= 0.5) points = 6;
        else if (percentRemaining >= 0.3) points = 4;
        else if (percentRemaining >= 0.1) points = 2;

        if (this.powerManager.isPowerModeActive()) {
            points *= 2; // DOUBLE POINTS
        }

        return points;
    }




    /**
     * Animate awarded points on screen
     * @param points
     * @param addPoints
     * @param x
     * @param y
     * @param callback
     */
    showPointsFeedback(points: number, addPoints: boolean, x: number, y: number, callback: () => void) {
        const color = addPoints  ? 0x00ff00 : 0xff0000;
        const sign = addPoints ? `plus` : `minus`;
        
        const text = createImageText(this, String(points), x, y, 0.5, this.currentTheme, true, false, color);
        const textSign = this.add.image(text.x-64, text.y, `${sign}_Style${this.currentTheme}`).setScale(0.5).setTint(color);
        
        this.tweens.add({
            targets: [text, textSign],
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                text.destroy();
                textSign.destroy();
                callback();
            }
        });
    }


    /**
     * Give user new word
     */
    spawnWord() {
        this.isPlaying = true;
        const nextWord = this.words.pop();

        if (!nextWord) {
            console.warn('No more words left to spawn!');
            return;
        }

        this.currentWord = nextWord;
        this.tileScale = checkWordFitmentOnScreen(this, this.currentWord);
        this.currentIndex = 0;

        this.letterImages.forEach(img => img.destroy());
        this.letterImages = [];

        const letterWidth = 128 * this.tileScale;
        const totalWordWidth = this.currentWord.length * letterWidth;
        const startX = (this.cameras.main.width - totalWordWidth) / 2;

        for (let i = 0; i < this.currentWord.length; i++) {
            const char = this.currentWord[i].toUpperCase();
            const img = this.add.image(startX + i * letterWidth, this.cameras.main.height / 2, `${char}_Style${this.currentTheme}`);
            img.setScale(this.tileScale);
            img.setOrigin(0.5);
            this.letterImages.push(img);
        }

        this.resetTimer();
    }

    createTimerBar() {
        this.timer = this.add.graphics();
    }
    
    createTimerEvent() {
        // Create timer event but paused initially
        this.timerEvent = this.time.addEvent({
            delay: config.timeLimit,
            paused: true,
            callback: this.handleGameOver,
            callbackScope: this,
            loop: false,
        });
    }
    resetTimer() {
        // Reset timer event: remove old, create new, paused initially
        if (this.timerEvent) {
            this.timerEvent.remove(false);
        }
        this.createTimerEvent();
        this.timerEvent.paused = false;
    }

    update() {
        if (!this.isPlaying || this.paused) return;  // Skip update logic while paused

        const remaining = this.timerEvent.getRemaining();
        const progress = Phaser.Math.Clamp(remaining / config.timeLimit, 0, 1);

        this.timer.clear();
        this.timer.fillStyle(0xffffff);
        this.timer.fillRect((this.cameras.main.width/2)-(this.timerBarWidth/2), 0, this.timerBarWidth * progress, this.timerBarHeight);

        if (remaining <= 0) {
            this.handleGameOver();
        }

        if (this.healthManager.getCurrentHealth() === 0) {
            this.handleGameOver();
        }
        
        // update power boost bar 
        this.powerManager.update();
    }


    private createScoreDisplayHeadings() {
        this.currentScoreLabel = createImageText(this, 'Score', 64, 64, 0.25, this.currentTheme, false, false);
        this.currentHighScoreLabel = createImageText(this, 'HighScore', 64, 128, 0.25, this.currentTheme, false, false);
    }

    private updateCurrentScoreDisplay(score: string, highScore: string) {
        // Destroy old score digits
        this.scoreDigits.forEach(d => d.destroy());
        this.scoreDigits = [];
        
        this.highScoreDigits.forEach(d => d.destroy());
        this.highScoreDigits = [];

        const scoreDisplay = createDynamicImageText(this, score, (this.currentScoreLabel.x+this.currentScoreLabel.width)/2+32, 96, 0.25, this.currentTheme, false, false);
        // Save new digits
        this.scoreDigits = scoreDisplay.tiles;
        
        const highScoreDisplay = createDynamicImageText(this, highScore, (this.currentHighScoreLabel.x+this.currentHighScoreLabel.width)/2+32, 160, 0.25, this.currentTheme, false, false);
        // Save new digits
        this.highScoreDigits = highScoreDisplay.tiles;
    }

    private createPauseButton() {
        const x = this.cameras.main.width - 64;
        const y = 64;
        
        const pauseButton = createImageText(this, 'P', x, y, 0.25, this.currentTheme, false, true);
        pauseButton.on('pointerdown', () => {
            this.soundManager.playClickSound();
            this.pauseGame();
            this.scene.launch('PauseScene', { onResume: this.resumeGame.bind(this) });
            this.scene.pause();
        }).on('pointerover', () => {
            pauseButton.setAlpha(0.80);
        }).on('pointerout', () => {
            pauseButton.setAlpha(1);
        });
    }
    pauseGame() {
        this.paused = true;
        this.timerEvent.paused = true;
    }

    resumeGame() {
        this.paused = false;
        this.timerEvent.paused = false;
    }


    private handleGameOver() {
        this.isPlaying = false;
        this.soundManager.playGameOverSound();

        if (this.score > this.gameState.highScore) {
            this.gameState.highScore = this.score;
        }

        const midX = this.cameras.main.width / 2;
        const midY = this.cameras.main.height / 2 - 100;
        this.showPointsFeedback(config.penalties.timeout, false, midX, midY, () => {
            this.gameState.currentPoints = this.score;
            this.gameState.lastSaved = Date.now();
            this.localStorage.save(this.gameState);
            this.checkAchievements();

            this.scene.start('GameOverScene', { score: this.score, highScore: this.gameState.highScore });
        });
    }
}
