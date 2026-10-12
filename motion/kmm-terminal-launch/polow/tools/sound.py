"""Sound design du film KMM Terminal, généré par code (aucun échantillon, aucune licence).

Usage : python3 tools/sound.py out/
Écrit :
  out/sfx.wav  : bruitages seuls, calés à l'image, à poser sous RISK MONEY (Instagram / CapCut)
  out/mix.wav  : beat généré à 103,7 BPM + bruitages (version autonome, sans RISK MONEY)
Chaque bruitage est placé pour que son pic tombe exactement sur son temps (même chronologie que film.html).
Écoute impossible ici : demander l'avis de Paul sur le rythme et le volume.
"""
import os, sys
import numpy as np
import soundfile as sf

SR = 48000
B = 60 / 103.7
b = lambda n: n * B
DUR = 64 * B
N = int(DUR * SR) + SR
rng = np.random.default_rng(11)          # graine fixe : même son à chaque rendu

def T(n): return np.arange(int(n * SR)) / SR
def env(t, a=.004, d=.25): return np.clip(t / a, 0, 1) * np.exp(-t / d)
def lp(x, k=24):                          # passe-bas simple (moyenne glissante)
    return np.convolve(x, np.ones(k) / k, 'same')
def hp(x, k=24): return x - lp(x, k)
def room(x, mix=.18, size=.12, seed=3):   # réverbération courte (convolution FFT)
    r = np.random.default_rng(seed); n = int(SR * size * 4)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / (SR * size)); ir /= np.abs(ir).sum() ** .5 * 8
    L = len(x) + n - 1; F = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:L]
    return np.pad(x, (0, n - 1)) + mix * wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max()

# ---------- Bruitages : chacun renvoie (signal mono, décalage du pic en s) ----------
def impact():        # le drop : coup de sub + claquement + queue
    t = T(2.2); f = 38 + 110 * np.exp(-t * 14)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, .002, .55)
    crack = hp(rng.standard_normal(len(t)), 6) * env(t, .001, .05) * .5
    return room(sub * 1.1 + crack, .25, .2), .004
def boom():          # coup plus léger (titres, fusion)
    t = T(1.2); f = 50 + 70 * np.exp(-t * 18)
    return room(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, .002, .28) * .8 + hp(rng.standard_normal(len(t)), 5) * env(t, .001, .02) * .25, .15), .004
def riser(d=1.2):    # montée avant le drop : bruit filtré + glissando, pic à la fin
    t = T(d); k = t / d
    noise = lp(rng.standard_normal(len(t)), 8) * k ** 2.2
    sweep = np.sin(2 * np.pi * np.cumsum(180 + 1400 * k ** 2) / SR) * k ** 3 * .25
    return (noise * .5 + sweep), d
def whoosh(d=.55, bright=10):   # souffle de mouvement, pic au milieu
    t = T(d); k = t / d
    w = lp(rng.standard_normal(len(t)), bright) * np.sin(np.pi * k) ** 2
    return room(w * .55, .2, .08), d * .5
def suck(d=.6):      # souffle inversé (les téléphones rentrent dans le central)
    s, _ = whoosh(d, 14); s = s[:int(d * SR)] * np.linspace(.2, 1, int(d * SR)) ** 2
    return s, d
def tap():           # tap sur l'écran : clic sec + petit corps grave
    t = T(.18)
    click = hp(rng.standard_normal(len(t)), 3) * env(t, .0005, .004) * .7
    body = np.sin(2 * np.pi * 180 * t) * env(t, .001, .03) * .5
    tick = np.sin(2 * np.pi * 2400 * t) * env(t, .0005, .006) * .25
    return room(click + body + tick, .12, .05), .001
def word():          # mot claqué : coup sourd court
    t = T(.35); f = 90 + 160 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, .001, .07) * .6 + hp(rng.standard_normal(len(t)), 4) * env(t, .0005, .01) * .2, .002
def glass(f0=1046.5):  # la carte loupe sort : verre + scintillement montant
    t = T(1.0)
    tone = sum(np.sin(2 * np.pi * f0 * m * t) * env(t, .003, .35 / m) / m for m in (1, 2.01, 3.03))
    shim = np.sin(2 * np.pi * np.cumsum(2200 + 1800 * np.minimum(t / .25, 1)) / SR) * env(t, .02, .09) * .15
    air, _ = whoosh(.35, 6)
    out = np.zeros(len(t)); out[:len(air)] += air[:len(t)] * .5
    return room(out + tone * .35 + shim, .3, .1), .18
def confirm():       # bonne réponse : deux notes (mi, sol)
    t = T(.9)
    def mar(f, d): tt = T(d); return (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt / .03)) * env(tt, .002, d / 3.5)
    out = np.zeros(len(t)); a = mar(659.25, .5); c = mar(783.99, .7); out[:len(a)] += a; i = int(.09 * SR); out[i:i + len(c)] += c[:len(t) - i]
    return room(out * .45, .25, .1), .002
def sparkle():       # le point doré se pose : carillon + étincelles
    t = T(1.4)
    bell = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (2.2 + i)) / (i + 1) for i, f in enumerate((1318.5, 1975.5, 2637)))
    sp = np.zeros(len(t))
    for j in range(14):
        i = int(rng.uniform(0, .5) * SR); n = int(.04 * SR); f = rng.uniform(3000, 6000)
        sp[i:i + n] += np.sin(2 * np.pi * f * np.arange(n) / SR) * np.exp(-np.arange(n) / SR / .008) * .12
    return room(bell * .35 + sp, .35, .15), .002
def logo():          # écran KMM TERMINAL : accord grave et brillant
    t = T(3.0)
    ch = sum(np.sin(2 * np.pi * f * t) * env(t, .01, 1.2) for f in (110, 164.8, 220, 329.6)) * .18
    sub = np.sin(2 * np.pi * 55 * t) * env(t, .005, .9) * .5
    return room(ch + sub, .4, .25), .01

# ---------- Chronologie (identique à film.html) ----------
LOUPES = [12.3, 16.6, 20.6, 26.0, 32.7, 36.7, 42.0, 44.7]
TAPS = [16, 20, 24, 25.5, 28, 32, 36, 41.5, 44]   # SIGNALS, COPILOT, EXPERT, FLOW, Espace, Formation, Reprendre, réponse, Communauté
HITS = []
HITS += [(b(0), word, .5), (b(1), word, .7), (b(4), word, .5), (b(5), word, .7)]       # « Ton » « terminal. » « Ta » « formation. »
HITS += [(b(8) - .3, whoosh, .9), (b(8), riser, .4), (b(8), impact, .75)]               # volet + montée + drop
HITS += [(b(9), boom, .55), (b(10), boom, .7)]                                         # « KMM » « Terminal. »
for a in LOUPES: HITS += [(b(a) - .45, whoosh, .45), (b(a) + .05, glass, .9)]          # le téléphone glisse, la loupe sort
HITS += [(b(t), tap, .7) for t in TAPS]
HITS += [(b(41.5) + .05, confirm, .7), (b(33), boom, .5)]                              # bonne réponse, « La Formation. »
HITS += [(b(48.7), whoosh, .9), (b(48.6) + .15, whoosh, .6), (b(48.6) + .3, whoosh, .6)]  # recul + deux téléphones
HITS += [(b(52) + .45, suck, .8), (b(52) + .5, boom, .8)]                              # fusion
HITS += [(b(54.3), logo, .75)]                                                          # écran KMM TERMINAL
HITS += [(b(55), word, .45), (b(56), word, .45), (b(57), word, .45), (b(58.8), sparkle, .8)]  # slogan + point doré
HITS += [(b(61), whoosh, .7), (b(61.8), sparkle, .45)]                                 # plan final + URL

def place(buf, sig, t, gain, pan=0.):
    s, peak = sig() if callable(sig) else sig
    i = int((t - peak) * SR)
    if i < 0: s = s[-i:]; i = 0
    n = min(len(s), N - i)
    buf[0, i:i + n] += s[:n] * gain * (1 - max(pan, 0)); buf[1, i:i + n] += s[:n] * gain * (1 + min(pan, 0))

def sfx_track():
    buf = np.zeros((2, N))
    for k, (t, fn, g) in enumerate(HITS):
        place(buf, fn, t, g, pan=(.25 if k % 3 == 1 else -.2 if k % 3 == 2 else 0))
    return buf

# ---------- Beat généré (version autonome) ----------
def beat_track():
    buf = np.zeros((2, N))
    kick = lambda: ((lambda t: np.sin(2 * np.pi * np.cumsum(48 + 130 * np.exp(-t * 32)) / SR) * env(t, .002, .2))(T(.45)), .003)
    hat = lambda: (hp(rng.standard_normal(int(.06 * SR)), 2) * env(T(.06), .001, .014) * .22, .001)
    clap = lambda: (room(hp(rng.standard_normal(int(.25 * SR)), 3) * env(T(.25), .002, .05) * .45, .2, .06), .002)
    roots = [55, 49, 43.65, 49]   # la, sol, fa, sol (basse)
    pad_ch = [[220, 261.6, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]]
    for bar in range(16):
        t0 = b(bar * 4); r = roots[bar % 4]
        # nappe partout (douce), sauf les 2 dernières secondes
        d = b(4); tt = T(d); pad = sum(np.sin(2 * np.pi * f * tt + .4 * np.sin(2 * np.pi * .25 * tt)) for f in pad_ch[bar % 4]) * .035 * np.minimum(tt / .3, 1) * np.minimum((d - tt) / .3, 1)
        place(buf, (pad, 0), t0, 1, .3); place(buf, (pad * .9, 0), t0, 1, -.3)
        if 2 <= bar < 12 or 13 <= bar < 15:          # beat plein après le drop ; respiration pendant le trio (mesure 12)
            for k in range(4):
                tb = t0 + b(k)
                place(buf, kick(), tb, .9)
                place(buf, hat(), tb + b(.5), 1, .35)
                if k in (1, 3): place(buf, clap(), tb, .55, -.1)
                bass = np.sin(2 * np.pi * r * T(b(.9))) * env(T(b(.9)), .005, .22) * .45
                place(buf, (bass, 0), tb, 1)
        elif bar < 2:                                  # avant le drop : pulsation sourde
            for k in range(4): place(buf, ((lambda t: np.sin(2 * np.pi * 60 * t) * env(t, .002, .09))(T(.2)), 0), t0 + b(k), .35)
    return buf

def save(path, buf, peak_db=-1.0, drive=2.2):
    buf = buf[:, :int(DUR * SR)]
    buf = np.tanh(buf / (np.abs(buf).max() + 1e-9) * drive)   # saturation douce : les petits sons remontent
    f = int(.6 * SR); buf[:, -f:] *= np.linspace(1, 0, f)
    buf = buf / (np.abs(buf).max() + 1e-9) * 10 ** (peak_db / 20)
    sf.write(path, buf.T.astype(np.float32), SR); print('écrit', path, f'{DUR:.2f} s')

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'out'; os.makedirs(out, exist_ok=True)
    s = sfx_track(); save(os.path.join(out, 'sfx.wav'), s)
    save(os.path.join(out, 'mix.wav'), beat_track() * .75 + s * .9)
