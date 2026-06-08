"""
YouTube Data API v3 — Video upload with OAuth 2.0
Docs: https://developers.google.com/youtube/v3/guides/uploading_a_video

Required env vars:
  YOUTUBE_CLIENT_ID      — OAuth 2.0 client ID from Google Cloud Console
  YOUTUBE_CLIENT_SECRET  — OAuth 2.0 client secret
  YOUTUBE_REFRESH_TOKEN  — Refresh token (generated on first run via browser auth)

On FIRST run, the script will open a browser for authentication and save the
refresh token to youtube_token.json automatically.
"""

import os
import json
import logging
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
TOKEN_FILE = Path(__file__).parent.parent / "youtube_token.json"


def _get_credentials() -> Credentials:
    client_id = os.getenv("YOUTUBE_CLIENT_ID")
    client_secret = os.getenv("YOUTUBE_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise EnvironmentError("YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET são obrigatórios.")

    creds = None

    # Load saved token
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    # Refresh or do first-time auth
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_config = {
                "installed": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
                }
            }
            flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save for next time
        TOKEN_FILE.write_text(creds.to_json())
        logger.info(f"Token do YouTube salvo em: {TOKEN_FILE}")

    return creds


class YouTubePoster:
    name = "YouTube"

    def __init__(self):
        # Validate credentials exist (actual auth happens on first post call)
        if not os.getenv("YOUTUBE_CLIENT_ID"):
            raise EnvironmentError("YOUTUBE_CLIENT_ID é obrigatório para YouTube.")

    def post(self, video_path: Path, content: dict) -> str:
        yt_data = content.get("youtube", {})
        title = yt_data.get("titulo", video_path.stem)[:100]
        description = yt_data.get("descricao", "")
        tags = yt_data.get("tags", [])

        # Add standard footer
        description += (
            "\n\n---\n"
            "Senta Aqui com o Léo | Leonardo Oliva\n"
            "Conselheiro em Dependência Química\n"
            "📞 Atendimento: https://linktr.ee/leofl78\n"
            "Instagram: @senta.aqui.com.o.leo\n"
        )

        creds = _get_credentials()
        youtube = build("youtube", "v3", credentials=creds)

        body = {
            "snippet": {
                "title": title,
                "description": description[:5000],
                "tags": tags,
                "categoryId": "26",  # How-to & Style (closest to education/health)
                "defaultLanguage": "pt",
                "defaultAudioLanguage": "pt",
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False,
            },
        }

        media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True)
        request = youtube.videos().insert(
            part=",".join(body.keys()),
            body=body,
            media_body=media,
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                logger.debug(f"YouTube upload: {int(status.progress() * 100)}%")

        video_id = response.get("id")
        logger.info(f"YouTube: postado com sucesso (video_id={video_id})")
        return f"https://youtu.be/{video_id}"
