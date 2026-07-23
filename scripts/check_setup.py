#!/usr/bin/env python3
"""First-run environment check for the cinematic-scroll-landing skill.

Stdlib only. Informational: prints a gap report, always exits 0.
The skill instructs the agent to run this on first use and offer to fix
gaps WITH the user's approval. Nothing here blocks design/build work.

Usage: python3 check_setup.py
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

results = []


def check(name, ok, detail, fix=""):
    results.append((name, ok, detail, fix))


def run(cmd):
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        return (out.stdout or out.stderr).strip().splitlines()[0] if (out.stdout or out.stderr) else ""
    except Exception:
        return ""


# Node (builds any site made with the skill)
node = shutil.which("node")
ver = run([node, "--version"]) if node else ""
try:
    node_ok = int(ver.lstrip("v").split(".")[0]) >= 18
except (ValueError, IndexError):
    node_ok = False
check("Node >= 18 (build sites)", node_ok, ver or "not found",
      "install Node LTS: https://nodejs.org")
check("npm", bool(shutil.which("npm")), "found" if shutil.which("npm") else "not found",
      "ships with Node")

# Python — this script running proves it
check("Python 3 (audit script)", True, sys.version.split()[0])
try:
    import PIL  # noqa: F401
    check("Pillow (optional: contact sheets, crops)", True, "importable")
except ImportError:
    check("Pillow (optional: contact sheets, crops)", False, "not importable",
          "pip install Pillow  (or skip: contact sheets can use a browser)")

# Chrome (visual verification harness)
chrome_paths = [
    r"C:/Program Files/Google/Chrome/Application/chrome.exe",
    r"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]
chrome = next((p for p in chrome_paths if Path(p).exists()), None) \
    or shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
check("Chrome (visual verification)", bool(chrome), chrome or "not found",
      "install Chrome, or set executablePath in the harness to your browser")

# Image generation (only needed when generating imagery)
key_file = Path.home() / ".banana" / "api_key.txt"
key_env = any(os.environ.get(k) for k in ("GOOGLE_AI_API_KEY", "GOOGLE_API_KEY", "GEMINI_API_KEY"))
img_detail = ("key file: " + str(key_file)) if key_file.exists() else ("env var set" if key_env else "no key found")
check("Image-gen key (only for imagery)", key_file.exists() or key_env, img_detail,
      "free key: https://aistudio.google.com/apikey -> save to ~/.banana/api_key.txt "
      "or an env var; an image-gen MCP/skill in your session also works "
      "(this script cannot see MCP tools)")

# Deploy CLIs (only at deploy time; presence check only — auth is interactive)
gh = shutil.which("gh")
check("gh CLI (GitHub deploys/pushes)", bool(gh), "found" if gh else "not found",
      "https://cli.github.com then `gh auth login` (verify: `gh auth status`)")
check("Vercel via npx (deploys)", node_ok, "available through npx" if node_ok else "needs Node",
      "auth is interactive: `npx vercel login` (verify: `npx vercel whoami`)")

print("cinematic-scroll-landing - first-run environment check\n")
for name, ok, detail, fix in results:
    mark = "[ OK ]" if ok else "[MISS]"
    print(f"{mark} {name}: {detail}")
    if not ok and fix:
        print(f"       fix: {fix}")
print("\nNothing above blocks design or build work. Imagery, verification,")
print("and deploy each need their line only when you reach that step.")
sys.exit(0)
