let screenShake = {
    x: 0,
    y: 0,
    intensity: 0
};

let cameraX = 0;

let worldWidth = 0;

function applyCameraShake(ctx) {
    screenShake.intensity = 0;
    screenShake.x = 0;
    screenShake.y = 0;
}
