"""
X (Twitter) API v2 — Tweet with video upload (uses v1.1 media endpoint)
Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets

Required env vars:
  TWITTER_API_KEY            — API Key (Consumer Key)
  TWITTER_API_SECRET         — API Key Secret (Consumer Secret)
  TWITTER_ACCESS_TOKEN       — Access Token
  TWITTER_ACCESS_TOKEN_SECRET — Access Token Secret
"""

import os
import time
import logging
import requests
from requests_oauthlib import OAuth1
from pathlib import Path

logger = logging.getLogger(__name__)

UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json"
TWEET_URL = "https://api.twitter.com/2/tweets"


class TwitterPoster:
    name = "X (Twitter)"

    def __init__(self):
        api_key = os.getenv("TWITTER_API_KEY")
        api_secret = os.getenv("TWITTER_API_SECRET")
        access_token = os.getenv("TWITTER_ACCESS_TOKEN")
        access_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET")

        if not all([api_key, api_secret, access_token, access_secret]):
            raise EnvironmentError(
                "TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN e "
                "TWITTER_ACCESS_TOKEN_SECRET são obrigatórios."
            )

        self.auth = OAuth1(api_key, api_secret, access_token, access_secret)

    def _upload_media(self, video_path: Path) -> str:
        """Chunked media upload — required for videos."""
        file_size = video_path.stat().st_size
        CHUNK_SIZE = 5 * 1024 * 1024  # 5 MB

        # INIT
        init_resp = requests.post(
            UPLOAD_URL,
            data={
                "command": "INIT",
                "total_bytes": file_size,
                "media_type": "video/mp4",
                "media_category": "tweet_video",
            },
            auth=self.auth,
            timeout=30,
        )
        init_resp.raise_for_status()
        media_id = init_resp.json()["media_id_string"]

        # APPEND
        with open(video_path, "rb") as f:
            segment = 0
            while True:
                chunk = f.read(CHUNK_SIZE)
                if not chunk:
                    break
                append_resp = requests.post(
                    UPLOAD_URL,
                    data={"command": "APPEND", "media_id": media_id, "segment_index": segment},
                    files={"media": chunk},
                    auth=self.auth,
                    timeout=120,
                )
                append_resp.raise_for_status()
                segment += 1

        # FINALIZE
        fin_resp = requests.post(
            UPLOAD_URL,
            data={"command": "FINALIZE", "media_id": media_id},
            auth=self.auth,
            timeout=30,
        )
        fin_resp.raise_for_status()

        # Poll until processing is complete
        for _ in range(30):
            processing = fin_resp.json().get("processing_info", {})
            state = processing.get("state")
            if state == "succeeded":
                break
            if state == "failed":
                raise RuntimeError(f"Twitter: processamento de mídia falhou: {fin_resp.json()}")
            wait = processing.get("check_after_secs", 5)
            logger.debug(f"Twitter media processing: {state}, aguardando {wait}s...")
            time.sleep(wait)
            status_resp = requests.get(
                UPLOAD_URL,
                params={"command": "STATUS", "media_id": media_id},
                auth=self.auth,
                timeout=30,
            )
            fin_resp = status_resp

        return media_id

    def post(self, video_path: Path, content: dict) -> str:
        tw_data = content.get("twitter", {})
        tweet_text = tw_data.get("texto", "")
        tweet_text = tweet_text[:280]

        media_id = self._upload_media(video_path)

        tweet_resp = requests.post(
            TWEET_URL,
            json={"text": tweet_text, "media": {"media_ids": [media_id]}},
            auth=self.auth,
            timeout=30,
        )
        tweet_resp.raise_for_status()
        tweet_id = tweet_resp.json().get("data", {}).get("id")
        logger.info(f"X/Twitter: postado com sucesso (tweet_id={tweet_id})")
        return f"https://x.com/sentaaquicomoleo/status/{tweet_id}"
