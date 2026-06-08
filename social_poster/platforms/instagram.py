"""
Instagram Graph API — Reels / Video publishing
Docs: https://developers.facebook.com/docs/instagram-api/guides/reels-publishing

Required env vars:
  INSTAGRAM_ACCESS_TOKEN  — Long-lived User Access Token with instagram_content_publish
  INSTAGRAM_USER_ID       — Numeric Instagram User ID (not the @handle)
"""

import os
import time
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.instagram.com/v21.0"


class InstagramPoster:
    name = "Instagram"

    def __init__(self):
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.user_id = os.getenv("INSTAGRAM_USER_ID")
        if not self.access_token or not self.user_id:
            raise EnvironmentError(
                "INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID são obrigatórios."
            )

    def _url(self, path: str) -> str:
        return f"{GRAPH_BASE}/{self.user_id}/{path}"

    def post(self, video_path: Path, content: dict) -> str:
        ig_data = content.get("instagram", {})
        descricao = ig_data.get("descricao", "")
        hashtags = ig_data.get("hashtags", [])
        caption = descricao + "\n\n" + " ".join(f"#{h.lstrip('#')}" for h in hashtags)
        caption = caption[:2200]

        # Instagram Graph API requires a publicly accessible video URL.
        # The script uploads the file to a temporary host or the user must
        # provide a CDN URL. Here we use a simple approach: upload via
        # the resumable upload endpoint if available, else guide the user.
        video_url = os.getenv("INSTAGRAM_VIDEO_CDN_URL")
        if not video_url:
            raise EnvironmentError(
                "Instagram requer que o vídeo esteja numa URL pública. "
                "Configure INSTAGRAM_VIDEO_CDN_URL ou use o upload automático (veja README)."
            )

        # Step 1: Create media container
        params = {
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": True,
            "access_token": self.access_token,
        }
        resp = requests.post(self._url("media"), params=params, timeout=60)
        resp.raise_for_status()
        container_id = resp.json().get("id")
        if not container_id:
            raise RuntimeError(f"Instagram não criou container: {resp.text}")

        # Step 2: Wait for container to be ready
        for attempt in range(24):
            time.sleep(5)
            status_resp = requests.get(
                f"{GRAPH_BASE}/{container_id}",
                params={"fields": "status_code", "access_token": self.access_token},
                timeout=30,
            )
            status = status_resp.json().get("status_code")
            if status == "FINISHED":
                break
            if status == "ERROR":
                raise RuntimeError(f"Instagram: erro no container {container_id}")
            logger.debug(f"Instagram container status: {status} (tentativa {attempt + 1}/24)")
        else:
            raise RuntimeError("Instagram: timeout aguardando container ficar pronto")

        # Step 3: Publish
        pub_resp = requests.post(
            self._url("media_publish"),
            params={"creation_id": container_id, "access_token": self.access_token},
            timeout=30,
        )
        pub_resp.raise_for_status()
        media_id = pub_resp.json().get("id")
        logger.info(f"Instagram: postado com sucesso (media_id={media_id})")
        return f"https://www.instagram.com/senta.aqui.com.o.leo/ (media_id: {media_id})"
