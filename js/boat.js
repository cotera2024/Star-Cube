(function() {
    var boat = {
        active: false,
        started: false,
        arrived: false,
        x: 12550,
        y: 470,
        w: 260,
        h: 60,
        deckY: 470,
        speed: 2.486,
        targetX: 21500,
        startX: 12550,
        timer: 0,
        bobOffset: 0,
        bannerAlpha: 1,
        bannerYOffset: 0,
        flags: [ {
            xRel: 40,
            yRel: -70,
            color: "#e74c3c",
            poleH: 70
        }, {
            xRel: 130,
            yRel: -105,
            color: "#f1c40f",
            poleH: 105
        }, {
            xRel: 210,
            yRel: -65,
            color: "#3498db",
            poleH: 65
        } ],
        enemySpawns: [],
        spawnIndex: 0
    };
    function generateSpawns() {
        var spawns = [];
        for (var d = 350; d < 8500; d += 480) {
            var spawnX = boat.startX + d;
            if (d % 960 === 350) {
                spawns.push({
                    type: "electric_squid",
                    triggerX: spawnX - 450,
                    spawnX: spawnX + 320,
                    spawnY: 260 + Math.random() * 80
                });
            } else {
                spawns.push({
                    type: "flying_fish",
                    triggerX: spawnX - 350,
                    spawnX: spawnX + 220,
                    spawnY: 485
                });
            }
        }
        return spawns;
    }
    window.initBoatLevel4 = function() {
        boat.active = true;
        boat.started = false;
        boat.arrived = false;
        boat.x = boat.startX;
        boat.y = 470;
        boat.deckY = 470;
        boat.timer = 0;
        boat.bobOffset = 0;
        boat.bannerAlpha = 1;
        boat.bannerYOffset = 0;
        boat.enemySpawns = generateSpawns();
        boat.spawnIndex = 0;
    };
    window.getBoatTravelState = function() {
        return {
            x: boat.x,
            started: boat.started,
            arrived: boat.arrived,
            spawnIndex: boat.spawnIndex
        };
    };
    window.restoreBoatTravelState = function(st) {
        if (!st) return;
        boat.active = true;
        boat.x = st.x;
        boat.started = st.started;
        boat.arrived = st.arrived;
        boat.spawnIndex = st.spawnIndex;
    };
    window.isBoatActive = function() {
        return boat.active && (typeof currentLevel !== "undefined" && currentLevel === 3);
    };
    window.isBoatTraveling = function() {
        return boat.active && boat.started && !boat.arrived && (typeof currentLevel !== "undefined" && currentLevel === 3);
    };
    window.getBoatSafeRespawn = function() {
        return {
            x: boat.x + boat.w * .45,
            y: boat.deckY - 45
        };
    };
    window.updateAndDrawBoat = function(ctx, cameraX) {
        if (!window.isBoatActive()) return;
        var camX = cameraX != null ? cameraX : 0;
        var p = typeof game !== "undefined" && game.player ? game.player : null;
        boat.timer++;
        boat.bobOffset = Math.sin(boat.timer * .05) * 4;
        boat.deckY = boat.y + boat.bobOffset;
        var onBoat = false;
        if (p && !p.dead) {
            var feetX = p.x + p.w * .5;
            var feetY = p.y + p.h;
            if (p.vy >= 0 && feetX >= boat.x + 8 && feetX <= boat.x + boat.w - 8 && feetY >= boat.deckY - 16 && feetY <= boat.deckY + 18) {
                onBoat = true;
                p.y = boat.deckY - p.h;
                p.vy = 0;
                p.onGround = true;
            }
        }
        if (!boat.started && onBoat) {
            boat.started = true;
            if (typeof showFloatingText === "function") {
                showFloatingText(boat.x + boat.w * .5, boat.deckY - 60, typeof __ === "function" ? __("flt_barco_zarpar") : "¡A ZARPAR!", "#f1c40f");
            }
        }
        var deltaX = 0;
        if (boat.started && !boat.arrived) {
            deltaX = boat.speed;
            boat.x += deltaX;
            if (p && p.x + p.w * .5 >= boat.x && p.x + p.w * .5 <= boat.x + boat.w && p.y + p.h <= boat.deckY + 20) {
                p.x += deltaX;
            }
            if (boat.bannerAlpha > 0) {
                boat.bannerAlpha = Math.max(0, boat.bannerAlpha - .02);
                boat.bannerYOffset -= .5;
            }
            if (boat.x >= boat.targetX) {
                boat.x = boat.targetX;
                boat.arrived = true;
                deltaX = 0;
                if (typeof showFloatingText === "function") {
                    showFloatingText(boat.x + boat.w * .5, boat.deckY - 60, typeof __ === "function" ? __("flt_checkpoint_desembarco") : "¡Tierra a la vista!", "#2ecc71");
                }
            }
            if (typeof game !== "undefined" && game.enemies) {
                while (boat.spawnIndex < boat.enemySpawns.length) {
                    var sp = boat.enemySpawns[boat.spawnIndex];
                    if (boat.x >= sp.triggerX) {
                        boat.spawnIndex++;
                        if (sp.type === "flying_fish") {
                            game.enemies.push(new Enemy({
                                x: sp.spawnX,
                                y: sp.spawnY,
                                type: "flying_fish",
                                color: "#ff6b81",
                                health: 1,
                                speed: 0,
                                range: 0,
                                isBoatFish: true
                            }));
                        } else if (sp.type === "electric_squid") {
                            game.enemies.push(new Enemy({
                                x: sp.spawnX,
                                y: sp.spawnY,
                                type: "electric_squid",
                                color: "#00f0ff",
                                health: 2,
                                speed: 1.4,
                                range: 120,
                                bulletType: "electric",
                                isElectricSquid: true
                            }));
                        }
                    } else {
                        break;
                    }
                }
            }
        }
        drawBoat(ctx, camX);
    };
    function drawBoat(ctx, camX) {
        var bx = boat.x - camX;
        var by = boat.deckY;
        var bw = boat.w;
        var bh = boat.h;
        if (bx + bw < -120 || bx > (typeof VIEW_W !== "undefined" ? VIEW_W : 800) + 120) {
            return;
        }
        ctx.save();
        if (boat.started && !boat.arrived) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            var foamX = bx + bw + Math.sin(boat.timer * .3) * 6;
            ctx.beginPath();
            ctx.ellipse(foamX - 12, by + bh * .65, 22, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(180, 230, 255, 0.35)";
            ctx.beginPath();
            ctx.ellipse(bx + 15, by + bh * .7, 18, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bx + 12, by);
        ctx.lineTo(bx + bw - 12, by);
        ctx.quadraticCurveTo(bx + bw + 24, by + bh * .35, bx + bw - 22, by + bh);
        ctx.lineTo(bx + 32, by + bh);
        ctx.quadraticCurveTo(bx - 16, by + bh * .45, bx + 12, by);
        ctx.closePath();
        var hullGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        hullGrad.addColorStop(0, "#8d5524");
        hullGrad.addColorStop(.4, "#653716");
        hullGrad.addColorStop(1, "#3d1e08");
        ctx.fillStyle = hullGrad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#2b1404";
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1.5;
        for (var plank = 1; plank <= 3; plank++) {
            var py = by + bh / 4 * plank;
            ctx.beginPath();
            ctx.moveTo(bx + 15 + plank * 4, py);
            ctx.lineTo(bx + bw - 15 - plank * 2, py);
            ctx.stroke();
        }
        ctx.fillStyle = "#a0612c";
        ctx.fillRect(bx + 6, by - 5, bw - 12, 7);
        ctx.strokeStyle = "#2b1404";
        ctx.strokeRect(bx + 6, by - 5, bw - 12, 7);
        ctx.restore();
        boat.flags.forEach(function(f, idx) {
            var mastX = bx + f.xRel;
            var mastTopY = by - f.poleH;
            ctx.fillStyle = "#5c3317";
            ctx.fillRect(mastX - 2.5, mastTopY, 5, f.poleH);
            ctx.fillStyle = "#f1c40f";
            ctx.beginPath();
            ctx.arc(mastX, mastTopY, 4, 0, Math.PI * 2);
            ctx.fill();
            var wave1 = Math.sin(boat.timer * .15 + idx) * 5;
            var wave2 = Math.cos(boat.timer * .18 + idx * 1.5) * 4;
            ctx.save();
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.moveTo(mastX, mastTopY + 4);
            ctx.quadraticCurveTo(mastX + 18, mastTopY + wave1 + 6, mastX + 32, mastTopY + wave2 + 12);
            ctx.lineTo(mastX + 22, mastTopY + wave1 + 18);
            ctx.quadraticCurveTo(mastX + 12, mastTopY + wave2 + 20, mastX, mastTopY + 24);
            ctx.closePath();
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.stroke();
            ctx.restore();
        });
        if (boat.bannerAlpha > .01) {
            ctx.save();
            ctx.globalAlpha = boat.bannerAlpha;
            var bannerX = bx + bw * .5;
            var bannerY = by - 120 + boat.bannerYOffset + Math.sin(boat.timer * .08) * 5;
            var text = typeof __ === "function" ? __("ui_a_zarpar") : "¡A ZARPAR!";
            ctx.font = 'bold 18px "Courier New", monospace, sans-serif';
            var textWidth = ctx.measureText(text).width;
            var padX = 14;
            var padY = 8;
            ctx.fillStyle = "#f39c12";
            ctx.strokeStyle = "#d35400";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(bannerX - textWidth * .5 - padX, bannerY - 14 - padY, textWidth + padX * 2, 28 + padY, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#d35400";
            ctx.beginPath();
            ctx.moveTo(bannerX - 8, bannerY + 14 + padY * .5);
            ctx.lineTo(bannerX + 8, bannerY + 14 + padY * .5);
            ctx.lineTo(bannerX, bannerY + 22 + padY * .5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 4;
            ctx.fillText(text, bannerX, bannerY);
            ctx.restore();
        }
        ctx.restore();
    }
})();
// Isaac Daniel Cotera - 2026 | Correo: isaacdanielcotera@gmail.com | Itch.io: https://cotera.itch.io | GitHub: https://github.com/cotera2024
