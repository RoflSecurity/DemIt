#!/usr/bin/env bash
set -e

echo "📦 Installing system dependencies for DemIt..."

# Update package lists
sudo apt update

# Install ffmpeg
sudo apt install -y ffmpeg

# Install yt-dlp
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Install Python venv + pip
sudo apt install -y python3 python3-venv python3-pip

# Create virtual environment for Demucs
DEM_VENV="$HOME/demucs-venv"
if [ ! -d "$DEM_VENV" ]; then
    python3 -m venv "$DEM_VENV"
fi

source "$DEM_VENV/bin/activate"

# Upgrade pip and install Demucs
pip install --upgrade pip
pip install demucs

deactivate

echo "✅ System dependencies installed!"
