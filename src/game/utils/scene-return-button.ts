import Phaser from 'phaser';

/**
 * Adds a back button to the top-right corner of the scene.
 * @param scene - The Phaser Scene
 * @param onClick - Callback function when button is clicked
 * @param theme - Optional theme for button styling (defaults to 'A')
 */
export function createBackButton(
    scene: Phaser.Scene,
    onClick: () => void,
    theme: string = 'A'
): Phaser.GameObjects.Image {
    const x = scene.cameras.main.width - 64;
    const y = 64;

    const backButton = scene.add
        .image(x, y, `directionWest_Style${theme}`)
        .setScale(0.33)
        .setInteractive({ useHandCursor: true });
    
    backButton
        .on('pointerdown', () => {
            onClick();
        })
        .on('pointerover', () => {
            backButton.setAlpha(0.8);
        })
        .on('pointerout', () => {
            backButton.setAlpha(1);
        });

    return backButton;
}
