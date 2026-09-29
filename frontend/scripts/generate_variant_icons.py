#!/usr/bin/env python3
"""Generate deterministic Android launcher icons for Salad Customer/Driver."""

from __future__ import annotations

import math
import struct
import sys
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"
ASSET_DIR = ROOT / "assets" / "app-icons"

DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

SPLASH_SIZES = {
    "drawable": (480, 320),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 720),
    "drawable-port-xhdpi": (640, 960),
    "drawable-port-xxhdpi": (960, 1440),
    "drawable-port-xxxhdpi": (1280, 1920),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (720, 480),
    "drawable-land-xhdpi": (960, 640),
    "drawable-land-xxhdpi": (1440, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
}


PALETTES = {
    "customer": {
        "background": "#CFF7DC",
        "background_top": "#EFFFF5",
        "background_bottom": "#9FE8BA",
        "primary": "#16A34A",
        "primary_dark": "#087A3B",
        "accent": "#F97316",
        "ink": "#14532D",
    },
    "driver": {
        "background": "#DDF7FF",
        "background_top": "#EFFBFF",
        "background_bottom": "#BDEDD4",
        "primary": "#0F766E",
        "primary_dark": "#123B52",
        "accent": "#22C55E",
        "ink": "#0F2742",
    },
}


def hex_to_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha


def blend_pixel(pixels: list[tuple[int, int, int, int]], width: int, x: int, y: int, color: tuple[int, int, int, int]) -> None:
    if x < 0 or y < 0 or x >= width or y >= len(pixels) // width:
        return
    sr, sg, sb, sa = color
    if sa <= 0:
        return
    idx = y * width + x
    dr, dg, db, da = pixels[idx]
    a = sa / 255
    inv = 1 - a
    out_a = sa + da * inv
    if out_a <= 0:
        pixels[idx] = (0, 0, 0, 0)
        return
    pixels[idx] = (
        round(sr * a + dr * inv),
        round(sg * a + dg * inv),
        round(sb * a + db * inv),
        round(out_a),
    )


def scale(value: float, width: int) -> int:
    return round(value / 108 * width)


def circle(pixels: list[tuple[int, int, int, int]], width: int, cx: float, cy: float, radius: float, color: tuple[int, int, int, int]) -> None:
    height = len(pixels) // width
    min_x = max(0, math.floor(cx - radius - 1))
    max_x = min(width - 1, math.ceil(cx + radius + 1))
    min_y = max(0, math.floor(cy - radius - 1))
    max_y = min(height - 1, math.ceil(cy + radius + 1))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            dist = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            if dist <= radius:
                blend_pixel(pixels, width, x, y, color)


def ellipse(
    pixels: list[tuple[int, int, int, int]],
    width: int,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    color: tuple[int, int, int, int],
) -> None:
    height = len(pixels) // width
    min_x = max(0, math.floor(cx - rx - 1))
    max_x = min(width - 1, math.ceil(cx + rx + 1))
    min_y = max(0, math.floor(cy - ry - 1))
    max_y = min(height - 1, math.ceil(cy + ry + 1))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            dx = (x + 0.5 - cx) / rx
            dy = (y + 0.5 - cy) / ry
            if dx * dx + dy * dy <= 1:
                blend_pixel(pixels, width, x, y, color)


def rotated_ellipse(
    pixels: list[tuple[int, int, int, int]],
    width: int,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    angle_degrees: float,
    color: tuple[int, int, int, int],
) -> None:
    height = len(pixels) // width
    angle = math.radians(angle_degrees)
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    radius = max(rx, ry)
    min_x = max(0, math.floor(cx - radius - 2))
    max_x = min(width - 1, math.ceil(cx + radius + 2))
    min_y = max(0, math.floor(cy - radius - 2))
    max_y = min(height - 1, math.ceil(cy + radius + 2))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            local_x = dx * cos_a + dy * sin_a
            local_y = -dx * sin_a + dy * cos_a
            if (local_x / rx) ** 2 + (local_y / ry) ** 2 <= 1:
                blend_pixel(pixels, width, x, y, color)


def rounded_rect(
    pixels: list[tuple[int, int, int, int]],
    width: int,
    x: float,
    y: float,
    w: float,
    h: float,
    r: float,
    color: tuple[int, int, int, int],
) -> None:
    height = len(pixels) // width
    min_x = max(0, math.floor(x))
    max_x = min(width - 1, math.ceil(x + w))
    min_y = max(0, math.floor(y))
    max_y = min(height - 1, math.ceil(y + h))
    for py in range(min_y, max_y + 1):
        for px in range(min_x, max_x + 1):
            qx = abs(px + 0.5 - (x + w / 2)) - (w / 2 - r)
            qy = abs(py + 0.5 - (y + h / 2)) - (h / 2 - r)
            outside = math.hypot(max(qx, 0), max(qy, 0))
            inside = min(max(qx, qy), 0)
            if outside + inside <= r:
                blend_pixel(pixels, width, px, py, color)


def polygon(pixels: list[tuple[int, int, int, int]], width: int, points: list[tuple[float, float]], color: tuple[int, int, int, int]) -> None:
    height = len(pixels) // width
    min_x = max(0, math.floor(min(x for x, _ in points)))
    max_x = min(width - 1, math.ceil(max(x for x, _ in points)))
    min_y = max(0, math.floor(min(y for _, y in points)))
    max_y = min(height - 1, math.ceil(max(y for _, y in points)))
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            inside = False
            j = len(points) - 1
            for i, (xi, yi) in enumerate(points):
                xj, yj = points[j]
                if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-9) + xi):
                    inside = not inside
                j = i
            if inside:
                blend_pixel(pixels, width, x, y, color)


def line(
    pixels: list[tuple[int, int, int, int]],
    width: int,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    thickness: float,
    color: tuple[int, int, int, int],
) -> None:
    distance = max(1, int(math.hypot(x2 - x1, y2 - y1)))
    for step in range(distance + 1):
        t = step / distance
        circle(pixels, width, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, color)


def gradient(width: int, height: int, top: tuple[int, int, int, int], bottom: tuple[int, int, int, int]) -> list[tuple[int, int, int, int]]:
    pixels: list[tuple[int, int, int, int]] = []
    for y in range(height):
        t = y / max(1, height - 1)
        pixels.extend(
            (
                round(top[0] * (1 - t) + bottom[0] * t),
                round(top[1] * (1 - t) + bottom[1] * t),
                round(top[2] * (1 - t) + bottom[2] * t),
                255,
            )
            for _ in range(width)
        )
    return pixels


def draw_customer_mark(pixels: list[tuple[int, int, int, int]], width: int) -> None:
    p = PALETTES["customer"]
    s = lambda v: scale(v, width)
    shadow = (20, 83, 45, 34)
    white = (255, 255, 255, 255)
    green = hex_to_rgba(p["primary"])
    dark = hex_to_rgba(p["primary_dark"])
    orange = hex_to_rgba(p["accent"])
    pale = (236, 253, 245, 255)
    lime = (132, 204, 22, 255)
    mint = (187, 247, 208, 255)

    ellipse(pixels, width, s(54), s(78), s(29), s(7), shadow)
    circle(pixels, width, s(54), s(55), s(33), white)
    circle(pixels, width, s(54), s(55), s(27), (240, 253, 244, 255))
    circle(pixels, width, s(54), s(55), s(23), mint)

    rotated_ellipse(pixels, width, s(42), s(52), s(7), s(15), -54, green)
    rotated_ellipse(pixels, width, s(52), s(45), s(8), s(15), -13, (34, 197, 94, 255))
    rotated_ellipse(pixels, width, s(64), s(49), s(7), s(15), 42, lime)
    rotated_ellipse(pixels, width, s(50), s(61), s(8), s(14), -30, (21, 128, 61, 255))
    rotated_ellipse(pixels, width, s(65), s(61), s(7), s(12), 62, (101, 163, 13, 255))
    rotated_ellipse(pixels, width, s(39), s(64), s(6), s(10), 34, (74, 222, 128, 255))

    line(pixels, width, s(42), s(45), s(48), s(58), s(1.5), dark)
    line(pixels, width, s(52), s(37), s(54), s(54), s(1.5), (21, 128, 61, 210))
    line(pixels, width, s(67), s(43), s(60), s(56), s(1.5), (77, 124, 15, 210))

    circle(pixels, width, s(45), s(57), s(3.8), orange)
    circle(pixels, width, s(60), s(54), s(4.2), (239, 68, 68, 255))
    circle(pixels, width, s(67), s(66), s(3.3), (251, 146, 60, 255))
    circle(pixels, width, s(55), s(67), s(2.8), (250, 204, 21, 255))

    ellipse(pixels, width, s(54), s(74), s(23), s(7), pale)
    line(pixels, width, s(32), s(70), s(76), s(70), s(2.2), (255, 255, 255, 210))


def draw_driver_mark(pixels: list[tuple[int, int, int, int]], width: int) -> None:
    p = PALETTES["driver"]
    s = lambda v: scale(v, width)
    navy = hex_to_rgba(p["primary_dark"])
    teal = hex_to_rgba(p["primary"])
    green = hex_to_rgba(p["accent"])
    white = (255, 255, 255, 255)
    shadow = (15, 39, 66, 45)
    line(pixels, width, s(25), s(35), s(84), s(35), s(4), (14, 165, 233, 120))
    line(pixels, width, s(84), s(35), s(84), s(52), s(4), (14, 165, 233, 120))
    circle(pixels, width, s(25), s(35), s(5), green)
    circle(pixels, width, s(84), s(52), s(5), teal)
    rounded_rect(pixels, width, s(22), s(48), s(62), s(22), s(7), shadow)
    rounded_rect(pixels, width, s(24), s(42), s(40), s(25), s(6), navy)
    polygon(pixels, width, [(s(63), s(49)), (s(75), s(49)), (s(82), s(58)), (s(82), s(67)), (s(63), s(67))], teal)
    rounded_rect(pixels, width, s(30), s(48), s(24), s(11), s(4), white)
    polygon(pixels, width, [(s(68), s(52)), (s(75), s(52)), (s(78), s(57)), (s(68), s(57))], white)
    ellipse(pixels, width, s(43), s(53), s(8), s(5), green)
    line(pixels, width, s(40), s(53), s(48), s(53), s(2), white)
    circle(pixels, width, s(36), s(69), s(7), navy)
    circle(pixels, width, s(70), s(69), s(7), navy)
    circle(pixels, width, s(36), s(69), s(3), white)
    circle(pixels, width, s(70), s(69), s(3), white)


def render_icon(variant: str, size: int, foreground_only: bool = False) -> list[tuple[int, int, int, int]]:
    supersample = 3 if size <= 192 else 2
    width = size * supersample
    height = width
    p = PALETTES[variant]
    if foreground_only:
        pixels = [(0, 0, 0, 0)] * (width * height)
    else:
        pixels = gradient(width, height, hex_to_rgba(p["background_top"]), hex_to_rgba(p["background_bottom"]))
        circle(pixels, width, scale(26, width), scale(24, width), scale(27, width), (255, 255, 255, 55))
        circle(pixels, width, scale(86, width), scale(90, width), scale(32, width), (255, 255, 255, 45))
    if variant == "customer":
        draw_customer_mark(pixels, width)
    else:
        draw_driver_mark(pixels, width)
    if supersample == 1:
        return pixels
    return downsample(pixels, width, supersample)


def paste_image(
    target: list[tuple[int, int, int, int]],
    target_width: int,
    source: list[tuple[int, int, int, int]],
    source_width: int,
    x: int,
    y: int,
) -> None:
    for sy in range(source_width):
        for sx in range(source_width):
            blend_pixel(target, target_width, x + sx, y + sy, source[sy * source_width + sx])


def render_splash(variant: str, width: int, height: int) -> list[tuple[int, int, int, int]]:
    p = PALETTES[variant]
    pixels = gradient(width, height, hex_to_rgba(p["background_top"]), hex_to_rgba(p["background_bottom"]))
    soft = (255, 255, 255, 46)
    circle(pixels, width, width * 0.18, height * 0.18, min(width, height) * 0.22, soft)
    circle(pixels, width, width * 0.82, height * 0.78, min(width, height) * 0.26, (255, 255, 255, 36))
    line_color = (20, 83, 45, 18) if variant == "customer" else (15, 39, 66, 18)
    step = max(38, min(width, height) // 12)
    for x in range(0, width, step):
      line(pixels, width, x, 0, x, height, 1, line_color)
    for y in range(0, height, step):
      line(pixels, width, 0, y, width, y, 1, line_color)

    icon_size = max(128, round(min(width, height) * 0.38))
    icon = render_icon(variant, icon_size)
    paste_image(pixels, width, icon, icon_size, (width - icon_size) // 2, round(height * 0.46 - icon_size / 2))

    progress_width = round(min(width * 0.42, 360))
    progress_height = max(6, round(min(width, height) * 0.012))
    progress_x = (width - progress_width) // 2
    progress_y = round(height * 0.67)
    rounded_rect(pixels, width, progress_x, progress_y, progress_width, progress_height, progress_height / 2, (255, 255, 255, 115))
    rounded_rect(
        pixels,
        width,
        progress_x,
        progress_y,
        progress_width * 0.62,
        progress_height,
        progress_height / 2,
        hex_to_rgba(p["primary"]),
    )
    return pixels


def downsample(pixels: list[tuple[int, int, int, int]], width: int, factor: int) -> list[tuple[int, int, int, int]]:
    out_width = width // factor
    out: list[tuple[int, int, int, int]] = []
    for y in range(out_width):
        for x in range(out_width):
            total = [0, 0, 0, 0]
            for dy in range(factor):
                for dx in range(factor):
                    r, g, b, a = pixels[(y * factor + dy) * width + x * factor + dx]
                    total[0] += r
                    total[1] += g
                    total[2] += b
                    total[3] += a
            count = factor * factor
            out.append(tuple(round(v / count) for v in total))  # type: ignore[arg-type]
    return out


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)


def write_png(path: Path, size: int, pixels: list[tuple[int, int, int, int]]) -> None:
    write_png_rect(path, size, size, pixels)


def write_png_rect(path: Path, width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(bytes(pixels[y * width + x]))
    data = b"\x89PNG\r\n\x1a\n"
    data += png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    data += png_chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    data += png_chunk(b"IEND", b"")
    path.write_bytes(data)


def svg_preview(variant: str) -> str:
    if variant == "customer":
        return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#EFFFF5"/><stop offset="1" stop-color="#9FE8BA"/></linearGradient></defs>
  <rect width="108" height="108" rx="24" fill="url(#bg)"/>
  <circle cx="26" cy="24" r="27" fill="#fff" opacity=".22"/><circle cx="86" cy="90" r="32" fill="#fff" opacity=".18"/>
  <ellipse cx="54" cy="78" rx="29" ry="7" fill="#14532D" opacity=".13"/>
  <circle cx="54" cy="55" r="33" fill="#fff"/>
  <circle cx="54" cy="55" r="27" fill="#F0FDF4"/>
  <circle cx="54" cy="55" r="23" fill="#BBF7D0"/>
  <ellipse cx="42" cy="52" rx="7" ry="15" fill="#16A34A" transform="rotate(-54 42 52)"/>
  <ellipse cx="52" cy="45" rx="8" ry="15" fill="#22C55E" transform="rotate(-13 52 45)"/>
  <ellipse cx="64" cy="49" rx="7" ry="15" fill="#84CC16" transform="rotate(42 64 49)"/>
  <ellipse cx="50" cy="61" rx="8" ry="14" fill="#15803D" transform="rotate(-30 50 61)"/>
  <ellipse cx="65" cy="61" rx="7" ry="12" fill="#65A30D" transform="rotate(62 65 61)"/>
  <ellipse cx="39" cy="64" rx="6" ry="10" fill="#4ADE80" transform="rotate(34 39 64)"/>
  <path d="M42 45l6 13M52 37l2 17M67 43l-7 13" stroke="#087A3B" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="45" cy="57" r="3.8" fill="#F97316"/><circle cx="60" cy="54" r="4.2" fill="#EF4444"/><circle cx="67" cy="66" r="3.3" fill="#FB923C"/><circle cx="55" cy="67" r="2.8" fill="#FACC15"/>
  <ellipse cx="54" cy="74" rx="23" ry="7" fill="#ECFDF5"/>
  <path d="M32 70h44" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".82"/>
</svg>
"""
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#EFFBFF"/><stop offset="1" stop-color="#BDEDD4"/></linearGradient></defs>
  <rect width="108" height="108" rx="24" fill="url(#bg)"/>
  <circle cx="26" cy="24" r="27" fill="#fff" opacity=".22"/><circle cx="86" cy="90" r="32" fill="#fff" opacity=".18"/>
  <path d="M25 35h59v17" fill="none" stroke="#0EA5E9" stroke-width="4" stroke-linecap="round" opacity=".5"/><circle cx="25" cy="35" r="5" fill="#22C55E"/><circle cx="84" cy="52" r="5" fill="#0F766E"/>
  <rect x="24" y="42" width="40" height="25" rx="6" fill="#123B52"/><path d="M63 49h12l7 9v9H63z" fill="#0F766E"/>
  <rect x="30" y="48" width="24" height="11" rx="4" fill="#fff"/><path d="M68 52h7l3 5H68z" fill="#fff"/>
  <ellipse cx="43" cy="53" rx="8" ry="5" fill="#22C55E"/><path d="M40 53h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  <circle cx="36" cy="69" r="7" fill="#123B52"/><circle cx="70" cy="69" r="7" fill="#123B52"/><circle cx="36" cy="69" r="3" fill="#fff"/><circle cx="70" cy="69" r="3" fill="#fff"/>
</svg>
"""


def write_color_resources(variant: str) -> None:
    color = PALETTES[variant]["background"]
    values = ANDROID_RES / "values" / "ic_launcher_background.xml"
    values.parent.mkdir(parents=True, exist_ok=True)
    values.write_text(
        f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{color}</color>\n</resources>\n',
        encoding="utf-8",
    )
    vector = ANDROID_RES / "drawable" / "ic_launcher_background.xml"
    vector.parent.mkdir(parents=True, exist_ok=True)
    vector.write_text(
        f'''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportHeight="108"
    android:viewportWidth="108">
    <path android:fillColor="{color}" android:pathData="M0,0h108v108h-108z" />
</vector>
''',
        encoding="utf-8",
    )


def write_splash_assets(variant: str) -> None:
    preview_width, preview_height = 1080, 1920
    write_png_rect(
        ASSET_DIR / f"salad-{variant}-splash.png",
        preview_width,
        preview_height,
        render_splash(variant, preview_width, preview_height),
    )
    for folder, (width, height) in SPLASH_SIZES.items():
        write_png_rect(ANDROID_RES / folder / "splash.png", width, height, render_splash(variant, width, height))


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in PALETTES:
        print("Usage: generate_variant_icons.py customer|driver", file=sys.stderr)
        return 2
    variant = sys.argv[1]
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    (ASSET_DIR / f"salad-{variant}-icon.svg").write_text(svg_preview(variant), encoding="utf-8")
    write_png(ASSET_DIR / f"salad-{variant}-icon.png", 512, render_icon(variant, 512))
    write_color_resources(variant)
    write_splash_assets(variant)
    for density, size in DENSITIES.items():
        full = render_icon(variant, size)
        foreground = render_icon(variant, round(size * 2.25), foreground_only=True)
        out_dir = ANDROID_RES / density
        write_png(out_dir / "ic_launcher.png", size, full)
        write_png(out_dir / "ic_launcher_round.png", size, full)
        write_png(out_dir / "ic_launcher_foreground.png", round(size * 2.25), foreground)
    print(f"Generated {variant} app icons and splash screens.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
