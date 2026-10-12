#!/bin/sh
# Rend film.html jusqu'au bout par tranches (limite de 5 min par commande), en reprenant au "next" affiché.
cd "$(dirname "$0")/.."
START=${1:-0}; END=${2:-1180}; WIN=$(cat tools/win.txt)
while [ "$START" -lt "$END" ]; do
  N=$(W=1080 H=1920 CUTS="4.629" python3 tools/render_frames.py film.html frames "$START" "$END" 270 30 "$WIN" | awk '/^next/{print $2}')
  [ -z "$N" ] && { echo "échec à $START"; exit 1; }
  echo "rendu jusqu'à $N"; START=$N
done
echo FIN
