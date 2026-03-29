import argparse
import os
import re
import shutil
import subprocess
from pathlib import Path


DEFAULT_VIDEO = Path(r"D:\github\seminardesign\finland1.mp4")
DEFAULT_OUTPUT = Path(r"D:\github\seminardesign\exports\finland-scenes")
KNOWN_FFMPEG_PATHS = [
    Path(r"C:\Program Files\CBD\CHITUBOX_Basic\Resources\DependentSoftware\recordOrShot\ffmpeg.exe"),
    Path(r"C:\ffmpeg\bin\ffmpeg.exe"),
]


def find_ffmpeg() -> str:
    for candidate in KNOWN_FFMPEG_PATHS:
        if candidate.exists():
            return str(candidate)
    discovered = shutil.which("ffmpeg")
    if discovered:
        return discovered
    raise FileNotFoundError("ffmpeg executable not found")


def parse_fps(log_text: str) -> float:
    match = re.search(r"(\d+(?:\.\d+)?)\s+fps", log_text)
    if match:
        return float(match.group(1))
    tbr_match = re.search(r"(\d+(?:\.\d+)?)\s+tbr", log_text)
    if tbr_match:
        return float(tbr_match.group(1))
    return 25.0


def detect_scene_times(ffmpeg: str, video_path: Path, threshold: float, min_gap: float) -> tuple[list[float], float]:
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-i",
        str(video_path),
        "-vf",
        f"select='gt(scene,{threshold})',showinfo",
        "-vsync",
        "vfr",
        "-f",
        "null",
        "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, errors="replace", check=False)
    log = (result.stdout or "") + "\n" + (result.stderr or "")
    fps = parse_fps(log)

    raw_times = [float(match) for match in re.findall(r"pts_time:([0-9]+(?:\.[0-9]+)?)", log)]
    filtered_times: list[float] = [0.0]
    last_time = -10_000.0
    for scene_time in raw_times:
        capture_time = max(0.0, scene_time - (1.0 / fps))
        if capture_time - last_time >= min_gap:
            filtered_times.append(capture_time)
            last_time = capture_time
    return filtered_times, fps


def export_frame(ffmpeg: str, video_path: Path, output_path: Path, time_seconds: float, max_width: int, quality: int) -> None:
    vf = f"scale='min(iw,{max_width})':-2"
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-ss",
        f"{time_seconds:.3f}",
        "-i",
        str(video_path),
        "-frames:v",
        "1",
        "-vf",
        vf,
        "-q:v",
        str(max(2, min(31, round((100 - quality) / 3.4) + 2))),
        str(output_path),
    ]
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract Finland scene keyframes.")
    parser.add_argument("--video", type=Path, default=DEFAULT_VIDEO)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--threshold", type=float, default=0.38)
    parser.add_argument("--min-gap", type=float, default=0.9)
    parser.add_argument("--max-width", type=int, default=1400)
    parser.add_argument("--quality", type=int, default=85)
    args = parser.parse_args()

    video_path = args.video.resolve()
    output_dir = args.output.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    ffmpeg = find_ffmpeg()
    scene_times, fps = detect_scene_times(ffmpeg, video_path, args.threshold, args.min_gap)

    manifest_lines = [
        f"source={video_path}",
        f"ffmpeg={ffmpeg}",
        f"fps={fps:.3f}",
        f"threshold={args.threshold}",
        f"min_gap={args.min_gap}",
        "",
    ]

    for index, scene_time in enumerate(scene_times, start=1):
        filename = f"finland-scene-{index:02d}.jpg"
        output_path = output_dir / filename
        export_frame(ffmpeg, video_path, output_path, scene_time, args.max_width, args.quality)
        manifest_lines.append(f"{filename}\t{scene_time:.3f}s")
        print(f"exported {filename} @ {scene_time:.3f}s")

    (output_dir / "manifest.txt").write_text("\n".join(manifest_lines), encoding="utf-8")
    print(f"done: {len(scene_times)} frames -> {output_dir}")


if __name__ == "__main__":
    main()
