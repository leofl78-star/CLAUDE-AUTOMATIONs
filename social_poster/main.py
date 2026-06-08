#!/usr/bin/env python3
"""
Social Media Auto-Poster — Senta Aqui com o Léo
Usage:  python main.py post
        python main.py post --folder /caminho/para/pasta
        python main.py post --platform tiktok
        python main.py post --dry-run
"""

import sys
import os
import shutil
import logging
import argparse
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv

# Load .env from same directory as this script
load_dotenv(Path(__file__).parent / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}

PLATFORM_MAP = {
    "tiktok": ("TIKTOK_ACCESS_TOKEN", "platforms.tiktok", "TikTokPoster"),
    "instagram": ("INSTAGRAM_ACCESS_TOKEN", "platforms.instagram", "InstagramPoster"),
    "youtube": ("YOUTUBE_CLIENT_ID", "platforms.youtube", "YouTubePoster"),
    "twitter": ("TWITTER_API_KEY", "platforms.twitter", "TwitterPoster"),
}


def _load_platform(name: str):
    """Dynamically load a platform class, return None if credentials are missing."""
    env_var, module_path, class_name = PLATFORM_MAP[name]
    if not os.getenv(env_var):
        logger.warning(f"  {name.upper()} ignorado — {env_var} não configurado no .env")
        return None
    try:
        import importlib
        mod = importlib.import_module(module_path)
        cls = getattr(mod, class_name)
        return cls()
    except EnvironmentError as e:
        logger.warning(f"  {name.upper()} ignorado — {e}")
        return None
    except Exception as e:
        logger.error(f"  {name.upper()} erro ao inicializar: {e}")
        return None


def post_command(folder: Path, selected_platforms: list[str], dry_run: bool):
    # Validate folder
    if not folder.exists():
        folder.mkdir(parents=True)
        print(f"\nPasta criada: {folder}")
        print("Adicione seus vídeos nessa pasta e execute 'post' novamente.\n")
        return

    # Find videos (skip files in subfolders)
    videos = sorted(
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in VIDEO_EXTENSIONS
    )

    if not videos:
        print(f"\nNenhum vídeo encontrado em: {folder}")
        print(f"Extensões suportadas: {', '.join(sorted(VIDEO_EXTENSIONS))}\n")
        return

    print(f"\n{'='*55}")
    print(f"  Senta Aqui com o Léo — Social Media Auto-Poster")
    print(f"{'='*55}")
    print(f"  Pasta:    {folder}")
    print(f"  Vídeos:   {len(videos)} encontrado(s)")
    print(f"  Modo:     {'DRY RUN (sem postar)' if dry_run else 'PUBLICAÇÃO REAL'}")
    print(f"{'='*55}\n")

    # Initialize platforms
    platforms = []
    if not dry_run:
        print("Inicializando plataformas...")
        for name in selected_platforms:
            p = _load_platform(name)
            if p:
                platforms.append(p)
                print(f"  ✓ {name.upper()} pronto")
        if not platforms:
            print("\nNenhuma plataforma configurada. Verifique seu .env e execute novamente.")
            sys.exit(1)
        print()

    # Initialize analyzer
    print("Inicializando analisador de vídeo (Claude)...")
    try:
        from analyzer import VideoAnalyzer
        analyzer = VideoAnalyzer()
        print("  ✓ Claude pronto\n")
    except Exception as e:
        print(f"  ✗ Falha ao inicializar Claude: {e}")
        sys.exit(1)

    # Posted folder
    posted_dir = folder / "postados"
    posted_dir.mkdir(exist_ok=True)

    # Process each video
    results_summary = []
    for idx, video_path in enumerate(videos, 1):
        print(f"[{idx}/{len(videos)}] Processando: {video_path.name}")
        print("-" * 50)

        # Analyze with Claude
        try:
            content = analyzer.analyze(video_path)
            tema = content.get("tema", "não identificado")
            print(f"  Tema: {tema}")
        except Exception as e:
            print(f"  ✗ Falha na análise: {e}")
            results_summary.append({"video": video_path.name, "status": "erro_analise"})
            continue

        # Show generated content in dry-run mode
        if dry_run:
            _print_content_preview(content)
            results_summary.append({"video": video_path.name, "status": "dry_run"})
            continue

        # Post to each platform
        post_results = {}
        for platform in platforms:
            try:
                url = platform.post(video_path, content)
                post_results[platform.name] = url
                print(f"  ✓ {platform.name}: {url}")
            except Exception as e:
                post_results[platform.name] = None
                print(f"  ✗ {platform.name}: {e}")

        # Move video to posted folder if at least one platform succeeded
        if any(post_results.values()):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            dest = posted_dir / f"{timestamp}_{video_path.name}"
            shutil.move(str(video_path), str(dest))
            print(f"  → Movido para: postados/{dest.name}")
            results_summary.append({"video": video_path.name, "status": "postado", "results": post_results})
        else:
            results_summary.append({"video": video_path.name, "status": "falha_total"})

        print()

    # Final summary
    print(f"\n{'='*55}")
    print("  RESUMO")
    print(f"{'='*55}")
    for r in results_summary:
        status_icon = {"postado": "✓", "dry_run": "~", "erro_analise": "✗", "falha_total": "✗"}.get(r["status"], "?")
        print(f"  {status_icon} {r['video']}: {r['status']}")
    print(f"{'='*55}\n")


def _print_content_preview(content: dict):
    print("\n  --- CONTEÚDO GERADO (DRY RUN) ---")

    tiktok = content.get("tiktok", {})
    print(f"\n  [TIKTOK]")
    print(f"  {tiktok.get('descricao', '')[:200]}...")
    print(f"  Hashtags: {' '.join(tiktok.get('hashtags', []))}")

    ig = content.get("instagram", {})
    print(f"\n  [INSTAGRAM]")
    print(f"  {ig.get('descricao', '')[:200]}...")

    yt = content.get("youtube", {})
    print(f"\n  [YOUTUBE]")
    print(f"  Título: {yt.get('titulo', '')}")
    print(f"  {yt.get('descricao', '')[:200]}...")

    tw = content.get("twitter", {})
    print(f"\n  [X/TWITTER]")
    print(f"  {tw.get('texto', '')}")
    print("  ----------------------------------\n")


def main():
    parser = argparse.ArgumentParser(
        description="Social Media Auto-Poster — Senta Aqui com o Léo",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Exemplos:\n"
            "  python main.py post\n"
            "  python main.py post --folder ~/Desktop/clips\n"
            "  python main.py post --platform youtube\n"
            "  python main.py post --dry-run\n"
        ),
    )
    parser.add_argument("command", choices=["post"], help="Comando a executar")
    parser.add_argument(
        "--folder", type=str,
        default=str(Path.home() / "Desktop" / "videos_para_postar"),
        help="Caminho da pasta com os vídeos (padrão: ~/Desktop/videos_para_postar)",
    )
    parser.add_argument(
        "--platform", type=str, default="all",
        help="Plataforma: all | tiktok | instagram | youtube | twitter (separar por vírgula)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Analisar e exibir conteúdo sem postar de verdade",
    )

    args = parser.parse_args()

    if args.platform == "all":
        selected = list(PLATFORM_MAP.keys())
    else:
        selected = [p.strip().lower() for p in args.platform.split(",")]
        invalid = [p for p in selected if p not in PLATFORM_MAP]
        if invalid:
            print(f"Plataformas inválidas: {', '.join(invalid)}")
            print(f"Opções válidas: {', '.join(PLATFORM_MAP.keys())}")
            sys.exit(1)

    post_command(
        folder=Path(args.folder),
        selected_platforms=selected,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
