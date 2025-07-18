// health-manager.ts
import Phaser from 'phaser';

export default class HealthManager {
    private scene: Phaser.Scene;
    private hearts: Phaser.GameObjects.Image[] = [];
    private currentHealth: number;
    private maxHealth: number;
    private heartSpacing: number = 32; // Adjust as needed
    private startX: number = 256; // Starting X position for the first heart
    private startY: number = 64; // Starting Y position for the hearts
    private currentTheme: string;

    constructor(scene: Phaser.Scene, initialHealth: number = 3, maxHealth: number = 5, currentTheme: string) {
        this.scene = scene;
        this.currentHealth = initialHealth;
        this.maxHealth = maxHealth;
        this.currentTheme = currentTheme;

        // Ensure initial health doesn't exceed max health
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
    }

    initHealth() {
        this.drawHealthBar();
    }

    private drawHealthBar() {
        
        // Clear existing hearts if any (useful for redrawing)
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];

        for (let i = 0; i < this.maxHealth; i++) {
            let heartAlpha = 0.25;
            if (i < this.currentHealth) {
                heartAlpha = 1;
            }

            const x = this.startX + (i * this.heartSpacing);
            const y = this.startY;

            const heart = this.scene.add
                .image(x, y, `heart_Style${this.currentTheme}`)
                .setOrigin(0.5) // Center the origin of the heart
                .setDepth(9) // Ensure hearts are on top of other game elements
                .setScale(0.25) // scale image
                .setAlpha(heartAlpha)

            this.hearts.push(heart);
        }
    }

    /**
     * Increases the current health by a specified amount, up to maxHealth.
     * @param amount The amount to increase health by. Defaults to 1.
     */
    public increaseHealth(amount: number = 1) {
        this.currentHealth += amount;
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
        this.updateHealthBar();
    }

    /**
     * Decreases the current health by a specified amount, down to 0.
     * @param amount The amount to decrease health by. Defaults to 1.
     */
    public decreaseHealth(amount: number = 1) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        this.updateHealthBar();
    }

    /**
     * Sets the current health to a specific value.
     * @param newHealth The new health value.
     */
    public setHealth(newHealth: number) {
        this.currentHealth = Phaser.Math.Clamp(newHealth, 0, this.maxHealth);
        this.updateHealthBar();
    }

    /**
     * Gets the current health value.
     * @returns The current health.
     */
    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    private updateHealthBar() {
        for (let i = 0; i < this.maxHealth; i++) {
            if (i < this.currentHealth) {
                this.hearts[i].setAlpha(1)
            } else {
                this.hearts[i].setAlpha(0.25)
            }
        }
    }

}