#!/usr/bin/env python3
"""Audit image references in a Vite/React src tree vs public/.

Catches the three failure modes learned in production:
  1. referenced files that don't exist (404s)
  2. public files never referenced (dead weight)
  3. shared-generic wiring: one image referenced by MANY data items
     (the "discontinued images" smell — users read it as missing art)

Usage: python3 audit_images.py [project_root]   (default: cwd)
"""
import os, re, sys, collections

root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
src, pub = os.path.join(root, 'src'), os.path.join(root, 'public')

REF = re.compile(r"""['"`](/[A-Za-z0-9_.\-]+\.(?:png|jpe?g|svg|webp|mp4))['"`]""")

refs = collections.Counter()
for dp, _, fns in os.walk(src):
    for fn in fns:
        if fn.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.html')):
            text = open(os.path.join(dp, fn), encoding='utf8', errors='ignore').read()
            refs.update(REF.findall(text))
idx = os.path.join(root, 'index.html')
if os.path.exists(idx):
    refs.update(REF.findall(open(idx, encoding='utf8', errors='ignore').read()))

missing = [r for r in refs if not os.path.exists(os.path.join(pub, r.lstrip('/')))]
public_files = {'/' + f for f in os.listdir(pub) if os.path.isfile(os.path.join(pub, f))} if os.path.isdir(pub) else set()
unused = sorted(public_files - set(refs))
generic = [(r, c) for r, c in refs.most_common()
           if c >= 8 and not any(k in r for k in ('logo', 'noise', 'emblem', 'favicon'))]

print(f'referenced: {len(refs)} | in public/: {len(public_files)}')
for r in missing: print(f'  MISSING (referenced, not on disk): {r}')
for r in unused:  print(f'  UNUSED (on disk, never referenced): {r}')
for r, c in generic: print(f'  GENERIC-WIRING? referenced {c}x: {r}')
if not (missing or unused or generic): print('  clean')
sys.exit(1 if missing else 0)
