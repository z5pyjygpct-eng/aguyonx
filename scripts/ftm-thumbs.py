#!/usr/bin/env python3
"""Find the Moment thumbnail generator (standard for every FTM venue).

  npx tsx scripts/ftm-thumbs-manifest.ts > /tmp/ftm-thumbs.json
  python3 scripts/ftm-thumbs.py /tmp/ftm-thumbs.json [--force] [--venue VENUE]

Renders public/thumbs/<venue>/<meetingId>.webp (640x360, YouTube-style) for every manifest entry
that does not have one yet (--force re-renders). Real frame when obtainable (YouTube auto frame
i.ytimg.com/vi/<id>/hq2.jpg, or ffmpeg grab from a direct mp4/HLS source at 40%/55%/30%/70% of the
runtime, skipping dark/flat/title-card frames); otherwise a branded navy placeholder.
Text: date, meeting type, and at most ONE top official-record business item + result.
Writes public/thumbs/<venue>/_status.json ({id: "frame"|"placeholder"}).
"""
import json, os, re, subprocess, sys, tempfile, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
S = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
F = lambda p, s: ImageFont.truetype(p, s)
W, H = 640, 360

def secs(d):
    h = re.search(r'(\d+)h', d or ''); m = re.search(r'(\d+)m', d or '')
    return (int(h.group(1)) if h else 0) * 3600 + (int(m.group(1)) if m else 0) * 60

def good(p):
    g = ImageStat.Stat(Image.open(p).convert('L'))
    if g.mean[0] < 40 or g.stddev[0] < 30: return False
    return ImageStat.Stat(Image.open(p).convert('HSV')).stddev[0] > 18

def granicus_stream(src):
    m = re.match(r'granicus-(\w+):(\d+)$', src or '')
    url = f'https://{m.group(1)}.granicus.com/player/clip/{m.group(2)}' if m else src
    if not url or 'granicus.com' not in url: return src
    h = subprocess.run(['curl', '-sL', '--max-time', '20', url], capture_output=True, text=True).stdout
    x = re.search(r'https?://[^"\' ]+\.mp4/playlist\.m3u8', h)
    return x.group(0) if x else None

def frame(e, tmp):
    if e.get('youtubeId'):
        for k in ('hq2', 'hq1', 'hq3'):
            p = f'{tmp}/{k}.jpg'
            r = subprocess.run(['curl', '-sf', '--max-time', '20', '-o', p, f"https://i.ytimg.com/vi/{e['youtubeId']}/{k}.jpg"])
            if r.returncode == 0 and os.path.getsize(p) > 3000:
                im = Image.open(p).convert('RGB'); w, h = im.size; ch = int(w * 9 / 16)
                im = im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch)); im.save(p + '.png')
                if good(p + '.png'): return p + '.png'
        return None
    u = granicus_stream(e.get('source'))
    if not u: return None
    d = secs(e.get('duration')) or 600
    for f in (0.4, 0.55, 0.3, 0.7):
        p = f'{tmp}/f{f}.png'
        try:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(int(d * f)), '-i', u, '-frames:v', '1', '-vf', 'scale=640:-2', p], capture_output=True, timeout=150)
        except subprocess.TimeoutExpired: continue
        if os.path.exists(p) and good(p): return p
        if not os.path.exists(p): return None  # source refused (e.g. 403); don't retry offsets
    return None

def wrap(d, text, font, w):
    out, cur = [], ''
    for wd in text.split():
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=font) <= w: cur = t
        else: out.append(cur); cur = wd
    out.append(cur); return [x for x in out if x]

def render(e, fp, out):
    bg = Image.open(fp).convert('RGB').resize((W, H)).transform((W, H), Image.AFFINE, (1, 0, -150, 0, 1, 0)) if fp else Image.new('RGB', (W, H), (16, 32, 62))
    ov = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(ov)
    for x in range(W):
        a = 238 if x < 300 else max(0, int(238 * (1 - (x - 300) / 260)))
        d.line([(x, 0), (x, H)], fill=(10, 22, 44, a))
    im = Image.alpha_composite(bg.convert('RGBA'), ov); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 10], fill=(179, 25, 66))
    d.text((28, 30), e['date'].upper(), font=F(B, 30), fill=(255, 214, 92))
    y = 72
    for ln in wrap(d, e['type'], F(S, 30), 400)[:2]:
        d.text((28, y), ln, font=F(S, 30), fill='white'); y += 36
    if e.get('headline'):
        y += 14; d.rectangle([28, y + 6, 36, y + 46], fill=(179, 25, 66))
        for ln in wrap(d, e['headline'], F(B, 38), 440)[:2]:
            d.text((50, y), ln, font=F(B, 38), fill='white'); y += 46
        if e.get('result'): d.text((50, y + 2), e['result'], font=F(B, 26), fill=(205, 215, 235))
    d.rounded_rectangle([28, 310, 190, 346], 6, fill=(179, 25, 66)); d.text((40, 314), 'aguyonx.com', font=F(B, 22), fill='white')
    dur = e.get('duration') or ''
    if dur:
        tw = d.textlength(dur, font=F(B, 22))
        d.rounded_rectangle([W - 32 - tw, 310, W - 12, 346], 5, fill=(0, 0, 0, 210)); d.text((W - 22 - tw, 314), dur, font=F(B, 22), fill='white')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.convert('RGB').save(out, quality=72, method=6)

def sig(e): return '|'.join(str(e.get(k) or '') for k in ('date', 'type', 'headline', 'result', 'duration'))

def job(e, force, prev):
    out = os.path.join(ROOT, e['out'])
    old = prev.get(e['venue'], {}).get(e['id'])
    # Re-render when text changed (e.g. official votes posted after the first render); keep frame kind.
    if os.path.exists(out) and not force and (old is None or SIGS.get(e['venue'], {}).get(e['id']) in (None, sig(e))):
        return e, old or 'existing'

    with tempfile.TemporaryDirectory() as tmp:
        try: fp = frame(e, tmp)
        except Exception: fp = None
        render(e, fp, out)
    return e, 'frame' if fp else 'placeholder'

SIGS = {}

def main():
    args = sys.argv[1:]; force = '--force' in args
    venue = args[args.index('--venue') + 1] if '--venue' in args else None
    entries = [e for e in json.load(open(args[0])) if not venue or e['venue'] == venue]
    prev = {}
    for v in {e['venue'] for e in entries}:
        p = os.path.join(ROOT, 'public/thumbs', v, '_status.json')
        prev[v] = json.load(open(p)) if os.path.exists(p) else {}
        sp = os.path.join(ROOT, 'public/thumbs', v, '_text.json')
        SIGS[v] = json.load(open(sp)) if os.path.exists(sp) else {}
    with cf.ThreadPoolExecutor(8) as ex:
        res = list(ex.map(lambda e: job(e, force, prev), entries))
    for v in prev:
        st = prev[v]; st.update({e['id']: s for e, s in res if e['venue'] == v and s != 'existing'})
        json.dump(st, open(os.path.join(ROOT, 'public/thumbs', v, '_status.json'), 'w'), indent=0, sort_keys=True)
        json.dump({e['id']: sig(e) for e in entries if e['venue'] == v}, open(os.path.join(ROOT, 'public/thumbs', v, '_text.json'), 'w'), indent=0, sort_keys=True)
        n = sum(1 for x in st.values() if x == 'frame'); print(f'{v}: {len(st)} thumbs, {n} real frames, {len(st) - n} placeholders')

if __name__ == '__main__': main()
