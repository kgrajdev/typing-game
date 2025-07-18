import Phaser from 'phaser';

export default class PowerManager {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Rectangle;
    private fill: Phaser.GameObjects.Rectangle;

    private powerLevel = 0;
    private active = false;
    private timerEvent?: Phaser.Time.TimerEvent;

    private readonly barWidth: number;
    private readonly barHeight = 20;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.barWidth = scene.cameras.main.width * 0.6; // 60% width
        const x = (scene.cameras.main.width - this.barWidth) / 2;
        const y = 80;

        // Background
        this.container = scene.add.rectangle(x, y, this.barWidth, this.barHeight, 0x000000).setOrigin(0, 0);

        // Fill
        this.fill = scene.add.rectangle(x, y, 0, this.barHeight, 0xffa500).setOrigin(0, 0);
    }

    increasePower() {
        if (this.active) return; // Don't fill while active
        this.powerLevel = Phaser.Math.Clamp(this.powerLevel + 5, 0, 100);
        this.updateBar();

        if (this.powerLevel >= 100) {
            this.activatePowerMode();
        }
    }

    private activatePowerMode() {
        this.active = true;
        this.container.setStrokeStyle(2, 0xffa500);
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: 1, to: 0.5 },
            yoyo: true,
            repeat: -1,
            duration: 300
        });

        this.timerEvent = this.scene.time.addEvent({
            delay: 20000, // 20 seconds
            callback: () => this.deactivatePowerMode()
        });
    }

    private deactivatePowerMode() {
        this.active = false;
        this.powerLevel = 0;
        this.updateBar();

        this.container.clearAlpha();
        this.container.setStrokeStyle(); // Remove glow
        if (this.timerEvent) this.timerEvent.remove();
    }

    private updateBar() {
        this.fill.width = (this.powerLevel / 100) * this.barWidth;
    }

    isPowerModeActive(): boolean {
        return this.active;
    }
}
