
export function checkWordFitmentOnScreen(scene: Phaser.Scene, currentWord: string): number {
    const maxWidth = scene.cameras.main.width * 0.9; // 90% of screen
    const letterWidth = 128;
    const requiredWidth = currentWord.length * letterWidth;
    return Math.min(0.5, maxWidth / requiredWidth);
}