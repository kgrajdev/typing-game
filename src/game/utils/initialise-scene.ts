export function initialiseScene(scene: Phaser.Scene) {
    scene.cameras.main.fadeIn(250);
    
    const width = scene.scale.width;
    const height = scene.scale.height;
    
    const bg = scene.add.image(width / 2, height / 2, '_StyleG').setOrigin(0.5).setDepth(0).setScale(1);
    // const bg = scene.add.image(width / 2, height / 2, 'game-bg').setOrigin(0.5).setDepth(0);
    // Calculate scale factors
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY); // cover entire screen
    bg.setScale(scale);
    
    return {width, height};
}