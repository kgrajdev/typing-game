// utils/notification-manager.ts
import Phaser from 'phaser';
import {createImageText} from "./create-text";
// import { createImageText } from './create-text';

interface Notification {
    content: string;
    duration: number;
}

export default class NotificationManager {
    private static instance: NotificationManager;
    private scene!: Phaser.Scene;
    private notificationActive = false;
    private notificationQueue: Notification[] = [];
    private currentNotification: Notification | null = null;

    private constructor() {}

    public static init(scene: Phaser.Scene): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        NotificationManager.instance.scene = scene;
        return NotificationManager.instance;
    }

    public static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            throw new Error('NotificationManager not initialized. Call init(scene) first.');
        }
        return NotificationManager.instance;
    }

    public showNotification(content: string, duration = 3000): void {
        const newNotification: Notification = { content, duration };

        if (
            this.currentNotification &&
            this.currentNotification.content === content
        ) {
            console.log('Duplicate notification (active), ignoring.');
            return;
        }

        if (this.notificationQueue.find(n => n.content === content)) {
            console.log('Duplicate notification (queued), ignoring.');
            return;
        }

        if (this.notificationActive) {
            this.notificationQueue.push(newNotification);
        } else {
            this.currentNotification = newNotification;
            this._displayNotification(newNotification);
        }
    }

    private _displayNotification(notification: Notification): void {
        const { content, duration } = notification;
        const { width, height } = this.scene.scale;
        
        const textImage = createImageText(
            this.scene,
            content,
            0,
            0,
            0.25,
            'G',
            true,
            false
        );

        const container = this.scene.add.container(width / 2, height + 100, [textImage]).setDepth(999);
        container.setSize(textImage.width, textImage.height);
        container.setAlpha(0); // Start invisible, fade in
        
        this.notificationActive = true;

        // Slide in + fade in
        this.scene.tweens.add({
            targets: container,
            y: height - 128, // Final visible position
            alpha: 1,
            ease: 'Cubic.easeOut',
            duration: 500,
            onComplete: () => {
                // Wait for the duration, then slide out
                this.scene.time.delayedCall(duration, () => {
                    this.scene.tweens.add({
                        targets: container,
                        y: height + 100,
                        alpha: 0,
                        ease: 'Cubic.easeIn',
                        duration: 500,
                        onComplete: () => {
                            container.destroy();
                            this.notificationActive = false;
                            this.currentNotification = null;

                            // Show next notification if queued
                            if (this.notificationQueue.length > 0) {
                                const next = this.notificationQueue.shift()!;
                                this.showNotification(next.content, next.duration);
                            }
                        }
                    });
                });
            }
        });
    }
}