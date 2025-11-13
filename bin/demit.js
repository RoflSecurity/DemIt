#!/usr/bin/env node
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const outputDir = path.resolve(process.cwd(), "output");

if (args[0] === "install") {
	try {
		console.log("📦 Installing system dependencies for DemIt...");
		execSync("sudo apt update && sudo apt install -y yt-dlp ffmpeg python3-venv python3-pip", { stdio: "inherit" });
		console.log("🔧 Setting up Demucs virtualenv...");
		execSync("python3 -m venv ~/demucs-venv", { stdio: "inherit" });
		execSync("~/demucs-venv/bin/pip install --upgrade pip", { stdio: "inherit" });
		execSync("~/demucs-venv/bin/pip install demucs", { stdio: "inherit" });
		console.log("✅ DemIt environment ready!");
	} catch (err) {
		console.error("❌ Installation failed:", err.message);
		process.exit(1);
	}
	process.exit(0);
}

const url = args[0];
if (!url) {
	console.error("❌ Usage: demit <youtube_url>");
	process.exit(1);
}

(async () => {
	try {
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		console.log(`🔗 Downloading audio from ${url}...`);
		execSync(`yt-dlp -x --audio-format mp3 "${url}" -o "${outputDir}/%(title)s.%(ext)s"`, { stdio: "inherit" });
		await new Promise(r => setTimeout(r, 1500));

		let files = fs.readdirSync(outputDir).filter(f => f.toLowerCase().endsWith(".mp3"));
		if (!files.length) {
			console.error("❌ No MP3 found in output directory:", outputDir);
			console.error("🪶 Files found:", fs.readdirSync(outputDir));
			process.exit(1);
		}

		console.log("Separating vocals with Demucs...");
		files.forEach(file => {
			console.log(`🎵 Processing ${file}...`);
			execSync(`~/demucs-venv/bin/demucs --two-stems vocals -d cpu --mp3 "${path.join(outputDir, file)}"`, { stdio: "inherit" });
		});

		console.log(`✅ All done! Separated tracks are in ${outputDir}/separated/htdemucs`);
	} catch (err) {
		console.error("❌ Error:", err.message);
		process.exit(1);
	}
})();