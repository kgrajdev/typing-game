export function fadeOutIn(callback: (arg0: any) => void, context: { cameras: { main: { fadeOut: (arg0: number) => void; fadeIn: (arg0: number) => void; }; }; time: { addEvent: (arg0: { delay: number; callback: () => void; callbackScope: any; }) => void; }; }) {
    context.cameras.main.fadeOut(250);
    context.time.addEvent({
        delay: 250,
        callback: () => {
            context.cameras.main.fadeIn(250);
            callback(context);
        },
        callbackScope: context
    });
}
export function fadeOutScene(scene: any, context: { cameras: { main: { fadeOut: (arg0: number) => void; }; }; time: { addEvent: (arg0: { delay: number; callback: () => void; callbackScope: any; }) => void; }; scene: { start: (arg0: any) => void; }; }) {
    context.cameras.main.fadeOut(250);
    context.time.addEvent({
        delay: 250,
        callback: () => {
            context.scene.start(scene);
        },
        callbackScope: context
    });
}