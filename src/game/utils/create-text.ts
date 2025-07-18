export function createImageText(
    scene: Phaser.Scene,
    text: string,
    x: number,
    y: number,
    scale: number = 1,
    style: string = scene.registry.get('tile-theme') ?? 'A',
    center: boolean = true,
    makeInteractive: boolean = false,
    tint?: number
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    const upperText = text.toUpperCase();
    const tileSize: number = 128;

    for (let i = 0; i < upperText.length; i++) {
        const char = upperText[i];
        if (/^[A-Z0-9]$/.test(char)) {
            
            const img = scene.add.image(i * tileSize*scale, 0, `${char}_Style${style.toUpperCase()}`);
            img.setOrigin(0.5);
            
            if (scale) {
                img.setScale(scale);
            }
            
            if (tint) {
                img.setTint(tint)
            }
            

            if (makeInteractive) {
                img.setInteractive({ useHandCursor: true });
                img.on('pointerdown', () => {
                    container.emit('pointerdown');
                });
                img.on('pointerover', () => {
                    container.emit('pointerover');
                });
                img.on('pointerout', () => {
                    container.emit('pointerout');
                });
            }

            container.add(img);
        }
    }

    if (center) {
        const totalWidth = (upperText.length - 1) * tileSize*scale;
        container.x = x - totalWidth / 2;
    }

    return container;
}

export function createDynamicImageText(
    scene: Phaser.Scene,
    text: string,
    x: number,
    y: number,
    scale: number = 1,
    style: string = scene.registry.get('tile-theme') ?? 'A',
    center: boolean = true,
    makeInteractive: boolean = false
): {
    container: Phaser.GameObjects.Container;
    setText: (newText: string) => void;
    tiles: Phaser.GameObjects.Image[];
} {
    const container = scene.add.container(x, y);
    const tileSize: number = 128;
    let tiles: Phaser.GameObjects.Image[] = [];

    const buildText = (text: string) => {
        container.removeAll(true); // remove old images
        tiles.forEach(t => t.destroy());
        tiles = [];

        const upperText = text.toUpperCase();

        for (let i = 0; i < upperText.length; i++) {
            const char = upperText[i];
            if (/^[A-Z0-9]$/.test(char)) {
                const img = scene.add.image(i * tileSize * scale, 0, `${char}_Style${style.toUpperCase()}`);
                img.setOrigin(0.5);
                img.setScale(scale);

                if (makeInteractive) {
                    img.setInteractive({ useHandCursor: true });
                    img.on('pointerdown', () => container.emit('pointerdown'));
                    img.on('pointerover', () => container.emit('pointerover'));
                    img.on('pointerout', () => container.emit('pointerout'));
                }

                container.add(img);
                tiles.push(img);
            }
        }

        if (center) {
            const totalWidth = (upperText.length - 1) * tileSize * scale;
            container.x = x - totalWidth / 2;
        }
    };

    buildText(text);

    return {
        container,
        setText: buildText,
        tiles,
    };
}

