let screenShake = {
    x: 0,
    y: 0,
    intensity: 0
};

let cameraX = 0;

let worldWidth = 0;

function applyCameraShake(ctx) {
    if (screenShake.intensity > 0) {
        screenShake.x = (Math.random() - .5) * screenShake.intensity;
        screenShake.y = (Math.random() - .5) * screenShake.intensity;
        screenShake.intensity *= .9;
        if (screenShake.intensity < .5) screenShake.intensity = 0;
    }
    ctx.translate(screenShake.x, screenShake.y);
}