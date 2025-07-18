import Phaser from 'phaser';
import SoundManager from "./sound-manager";

export default class PowerManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Rectangle;
    private fill: Phaser.GameObjects.Rectangle;

    private powerLevel = 0;
    private active = false;
    private timerEvent?: Phaser.Time.TimerEvent;

    private readonly barWidth: number;
    private readonly barHeight = 15;
    private readonly maxPower = 100;
    private powerIncrement = 5;
    private readonly powerModeDuration = 20000; // 20 seconds
    private powerModeStartTime = 0;
    private soundManager: SoundManager;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.barWidth = scene.cameras.main.width; // 100% of screen width
        const x = 0;
        const y = 30;

        // Background (black)
        this.container = scene.add.rectangle(x, y, this.barWidth, this.barHeight, 0x000000).setOrigin(0, 0);

        // Fill (orange)
        this.fill = scene.add.rectangle(x, y, 0, this.barHeight, 0xffa500).setOrigin(0, 0);

        this.soundManager = SoundManager.getInstance();
    }

    /**
     * Increase power by 5 for each completed word
     */
    increasePower(points: number) {
        if (this.active) return; // Don't increase while in Power Mode

        if (points === 10) this.powerIncrement = 10;
        else if (points === 8) this.powerIncrement = 8;
        else if (points === 6)  this.powerIncrement = 3;
        else if (points === 4)  this.powerIncrement = 2;
        else if (points === 2)  this.powerIncrement = 0;
        
        this.powerLevel = Phaser.Math.Clamp(this.powerLevel + this.powerIncrement, 0, this.maxPower);
        this.updateBar();

        if (this.powerLevel >= this.maxPower) {
            this.soundManager.playPowerBoostTriggeredSound();
            this.activatePowerMode();
        }
    }

    decreasePower() {
        if (this.active) return; // Don't decrease while in Power Mode

        if (this.powerLevel > 2) {
            this.powerLevel = Math.floor(this.powerLevel / 2);
            this.updateBar();   
        }
    }

    /**
     * Activate Power Mode for 20 seconds and start draining the bar
     */
    private activatePowerMode() {
        this.active = true;
        this.powerModeStartTime = this.scene.time.now;

        // Glow effect
        this.container.setStrokeStyle(2, 0xffa500);
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: 1, to: 0.5 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        // Timer event for Power Mode
        this.timerEvent = this.scene.time.addEvent({
            delay: this.powerModeDuration,
            callback: () => this.deactivatePowerMode()
        });
    }

    /**
     * Deactivate Power Mode, reset bar
     */
    private deactivatePowerMode() {
        this.active = false;
        this.powerLevel = 0;
        this.updateBar();

        this.container.clearAlpha();
        this.container.setStrokeStyle(); // Remove glow
        if (this.timerEvent) this.timerEvent.remove();
    }

    /**
     * Update bar based on current power level or time left in Power Mode
     */
    private updateBar() {
        this.fill.width = (this.powerLevel / this.maxPower) * this.barWidth;
    }

    /**
     * Called every frame from GameScene.update()
     * If Power Mode active, reduce the fill width as time passes
     */
    update() {
        if (this.active) {
            const elapsed = this.scene.time.now - this.powerModeStartTime;
            const remaining = Phaser.Math.Clamp(1 - elapsed / this.powerModeDuration, 0, 1);
            this.fill.width = this.barWidth * remaining;

            if (remaining <= 0) {
                this.deactivatePowerMode();
            }
        }
    }

    /**
     * Check if Power Mode is active
     */
    isPowerModeActive(): boolean {
        return this.active;
    }
}
