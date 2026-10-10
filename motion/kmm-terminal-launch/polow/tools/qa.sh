#!/bin/sh
# Contrôle qualité d'un MP4 (à regarder avec view, puis noter chaque critère /10).
# Usage : sh qa.sh <video.mp4> <dossier> [t_mouvement_rapide]
V=$1; D=$2; T=${3:-1}; mkdir -p $D
ffmpeg -v error -y -i $V -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 $D/contact.png           # vue d'ensemble
ffmpeg -v error -y -ss $(echo "$T-0.1" | bc) -i $V -vf "scale=320:-1,tile=12x1" -frames:v 1 $D/strip.png  # 12 images autour d'un mouvement rapide
ffmpeg -v error -y -i $V -vf "fps=1,scale=360:-1,tile=5x3" -frames:v 1 $D/phone.png             # lisibilité à largeur téléphone
python3 - "$V" <<'PY'
# sauts d'image : écart image à image > 3x ses voisines (coupes voulues incluses : les justifier)
import sys,subprocess,numpy as np
w,h=160,90
raw=subprocess.run(['ffmpeg','-v','error','-i',sys.argv[1],'-vf',f'scale={w}:{h},format=gray','-f','rawvideo','-'],capture_output=True).stdout
f=np.frombuffer(raw,np.uint8).reshape(-1,h,w).astype(np.float32); d=np.abs(np.diff(f,axis=0)).mean((1,2))
for i in range(2,len(d)-2):
    nb=max(np.median(d[i-2:i]),np.median(d[i+1:i+3]),.5)
    if d[i]>3*nb and d[i]>4: print(f'saut image {i+1} ({(i+1)/30:.2f}s) : {d[i]:.1f} vs {nb:.1f}')
print('analyse terminée,',len(f),'images')
PY
ls $D
