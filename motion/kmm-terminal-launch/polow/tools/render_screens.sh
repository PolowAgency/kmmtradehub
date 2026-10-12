#!/bin/sh
# Rend les textures d'écran (screen.html principal + iPhone de gauche du trio)
cd "$(dirname "$0")/.."
rm -rf scr/main scr/left; N=0
while [ "$N" -lt 1111 ]; do N=$(W=786 H=1704 python3 tools/render_frames.py screen.html scr/main $N 1111 250 30 | awk '/^next/{print $2}'); [ -z "$N" ] && exit 1; done
W=786 H=1704 python3 tools/render_frames.py screen_left.html scr/left 820 935 250 30 | tail -1
echo "écrans : $(ls scr/main | wc -l) + $(ls scr/left | wc -l)"
