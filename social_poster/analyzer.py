"""
Video analyzer — extracts frames with ffmpeg and uses Claude Vision to generate
platform-specific content for "Senta Aqui com o Léo".
"""

import os
import json
import base64
import subprocess
import tempfile
import logging
from pathlib import Path

import anthropic

from brand_config import BRAND_SYSTEM_PROMPT, ANALYSIS_PROMPT

logger = logging.getLogger(__name__)


class VideoAnalyzer:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY não encontrado no .env")
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-opus-4-8"

    def extract_frames(self, video_path: Path, num_frames: int = 5) -> list[str]:
        """Extract evenly spaced frames from a video, return as base64 JPEG strings."""
        frames = []
        with tempfile.TemporaryDirectory() as tmpdir:
            # Get video duration
            probe = subprocess.run(
                [
                    "ffprobe", "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    str(video_path),
                ],
                capture_output=True, text=True,
            )
            try:
                duration = float(probe.stdout.strip())
            except ValueError:
                duration = 30.0  # fallback

            # Extract frames at evenly spaced intervals
            interval = duration / (num_frames + 1)
            for i in range(1, num_frames + 1):
                timestamp = interval * i
                frame_path = os.path.join(tmpdir, f"frame_{i:02d}.jpg")
                subprocess.run(
                    [
                        "ffmpeg", "-ss", str(timestamp),
                        "-i", str(video_path),
                        "-vframes", "1",
                        "-q:v", "3",
                        "-vf", "scale=720:-1",
                        frame_path,
                        "-y",
                    ],
                    capture_output=True,
                )
                if os.path.exists(frame_path):
                    with open(frame_path, "rb") as f:
                        frames.append(base64.standard_b64encode(f.read()).decode("utf-8"))

        return frames

    def analyze(self, video_path: Path) -> dict:
        """Analyze a video and return platform-specific content as a dict."""
        logger.info(f"Extraindo frames de {video_path.name}...")
        frames = self.extract_frames(video_path)

        if not frames:
            raise RuntimeError(f"Não foi possível extrair frames de {video_path.name}. Verifique se o ffmpeg está instalado.")

        logger.info(f"{len(frames)} frames extraídos. Enviando para Claude...")

        # Build the message content: frames + analysis prompt
        content = []
        for i, frame_b64 in enumerate(frames, 1):
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": frame_b64,
                },
            })
        content.append({
            "type": "text",
            "text": ANALYSIS_PROMPT,
        })

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=BRAND_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )

        raw = response.content[0].text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            logger.error(f"Claude retornou JSON inválido:\n{raw}")
            raise ValueError(f"Falha ao parsear resposta do Claude: {e}") from e

        return data
