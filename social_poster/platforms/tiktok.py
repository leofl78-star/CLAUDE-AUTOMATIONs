"""
TikTok Content Posting API v2
Docs: https://developers.tiktok.com/doc/content-posting-api-get-started

Required env vars:
  TIKTOK_ACCESS_TOKEN  — OAuth 2.0 access token from TikTok Developer Portal
  TIKTOK_OPEN_ID       — Open ID of the authenticated TikTok user
"""

import os
import time
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/"
STATUS_URL = "https://open.tiktokapis.com/v2/post/publish/status/fetch/"


class TikTokPoster:
    name = "TikTok"

    def __init__(self):
        self.access_token = os.getenv("TIKTOK_ACCESS_TOKEN")
        self.open_id = os.getenv("TIKTOK_OPEN_ID")
        if not self.access_token or not self.open_id:
            raise EnvironmentError(
                "TIKTOK_ACCESS_TOKEN e TIKTOK_OPEN_ID são obrigatórios para TikTok."
            )

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json; charset=UTF-8",
        }

    def post(self, video_path: Path, content: dict) -> str:
        tiktok_data = content.get("tiktok", {})
        descricao = tiktok_data.get("descricao", "")
        hashtags = tiktok_data.get("hashtags", [])
        caption = descricao + "\n\n" + " ".join(f"#{h.lstrip('#')}" for h in hashtags)
        caption = caption[:2200]

        file_size = video_path.stat().st_size

        # Step 1: Initialize upload
        init_payload = {
            "post_info": {
                "title": caption,
                "privacy_level": "PUBLIC_TO_EVERYONE",
                "disable_duet": False,
                "disable_comment": False,
                "disable_stitch": False,
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": file_size,
                "chunk_size": file_size,
                "total_chunk_count": 1,
            },
        }

        resp = requests.post(INIT_URL, json=init_payload, headers=self._headers(), timeout=30)
        resp.raise_for_status()
        data = resp.json().get("data", {})
        publish_id = data.get("publish_id")
        upload_url = data.get("upload_url")

        if not upload_url:
            raise RuntimeError(f"TikTok não retornou upload_url: {resp.text}")

        # Step 2: Upload video binary
        with open(video_path, "rb") as f:
            video_bytes = f.read()

        upload_headers = {
            "Content-Type": "video/mp4",
            "Content-Range": f"bytes 0-{file_size - 1}/{file_size}",
            "Content-Length": str(file_size),
        }
        upload_resp = requests.put(upload_url, data=video_bytes, headers=upload_headers, timeout=300)
        upload_resp.raise_for_status()

        # Step 3: Poll status
        for attempt in range(20):
            time.sleep(5)
            status_resp = requests.post(
                STATUS_URL,
                json={"publish_id": publish_id},
                headers=self._headers(),
                timeout=30,
            )
            status_data = status_resp.json().get("data", {})
            status = status_data.get("status")
            if status == "PUBLISH_COMPLETE":
                share_url = status_data.get("publicaly_available_post_id", [])
                logger.info(f"TikTok: postado com sucesso (publish_id={publish_id})")
                return f"https://www.tiktok.com/@sentaaquicomolleo (publish_id: {publish_id})"
            if status in ("FAILED", "CANCELLED"):
                raise RuntimeError(f"TikTok falhou ao publicar: {status_data}")
            logger.debug(f"TikTok status: {status} (tentativa {attempt + 1}/20)")

        raise RuntimeError("TikTok: timeout aguardando publicação")
