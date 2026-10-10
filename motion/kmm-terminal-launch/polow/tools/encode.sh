#!/bin/sh
# Usage : sh encode.sh <dossier_images> <audio.wav> <sortie.mp4> [fps] [debit]
# Deux passes H.264 (~4,5 Mbit/s => < 25 Mo pour 40 s), BT.709 plage TV, audio AAC normalisé à -14 LUFS.
D=$1; A=$2; O=$3; FPS=${4:-30}; BR=${5:-4500k}
VF="scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p"
ffmpeg -v error -y -framerate $FPS -i $D/f_%05d.jpg -vf "$VF" -c:v libx264 -preset faster -b:v $BR -pass 1 -passlogfile /tmp/_p -an -f mp4 /dev/null && \
ffmpeg -v error -y -framerate $FPS -i $D/f_%05d.jpg -i $A -vf "$VF" -c:v libx264 -preset faster -b:v $BR -maxrate 7M -bufsize 9M -pass 2 -passlogfile /tmp/_p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest $O && ls -la $O
