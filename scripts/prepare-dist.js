const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

fs.copyFileSync(path.join(rootDir, "index.html"), path.join(distDir, "index.html"));

const dirsToCopy = ["css", "js", "assets"];
for (const dir of dirsToCopy) {
    const src = path.join(rootDir, dir);
    const dest = path.join(distDir, dir);
    if (fs.existsSync(src)) {
        fs.cpSync(src, dest, { recursive: true });
    }
}

