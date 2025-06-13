#!/usr/bin/env bash

set -euo pipefail

### Paramètres ###############################################################
#INPUT="12062025.mp4"      # vidéo source
INT=1                     # intervalle secondes entre vignettes
W=180                     # largeur cible
COLS=10                   # colonnes dans le sprite
JPEG_Q=100                # qualité JPEG (0–100, 85 recommended)
WEBP_Q=100                # qualité WebP (0–100, 75 recommended)

STREAM_DIR="streaming_output"
THUMBNAILS_DIR="$STREAM_DIR/thumbnails"
mkdir -p "$THUMBNAILS_DIR"
###############################################################################

INPUT_FILE=""
for ext in mp4 mkv avi mov webm; do
    found_file=$(find . -maxdepth 1 -type f -iname "*.${ext}" -print -quit)
    if [[ -n "$found_file" ]]; then
        INPUT_FILE="$found_file"
        INPUT_FILE="${INPUT_FILE#./}"
        break
    fi
done

if [[ -z "$INPUT_FILE" ]]; then
    echo "❓ Aucun fichier vidéo trouvé automatiquement avec les extensions courantes."
    echo "📂 Liste des fichiers du répertoire courant (pour aide) :"
    ls -lah
    echo ""
    read -rp "📝 Entrez le nom du fichier source (ou chemin) : " INPUT_FILE
fi

if [[ ! -f "$INPUT_FILE" ]]; then
    echo "❌ Erreur : Le fichier '$INPUT_FILE' n'existe pas ou n'est pas un fichier régulier."
    exit 1
fi

############################ 1. EXTRACTIONS ##################################
echo "➜  Extraction JPEG (q=$JPEG_Q)…"
Qscale=$(( (100 - JPEG_Q) / 5 + 2 ))
ffmpeg -hide_banner -loglevel error -i "$INPUT_FILE" \
       -vf "fps=1/$INT,scale=${W}:-1" \
       -q:v "$Qscale" \
       "$THUMBNAILS_DIR/img_%05d.jpg"

echo "➜  Extraction WebP (q=$WEBP_Q)…"
ffmpeg -hide_banner -loglevel error -i "$INPUT_FILE" \
       -vf "fps=1/$INT,scale=${W}:-1" \
       -vcodec libwebp -lossless 0 -q:v "$WEBP_Q" \
       "$THUMBNAILS_DIR/img_%05d.webp"

############################ 2. SPRITES ######################################
echo "➜  Sprite JPEG…"
montage "$THUMBNAILS_DIR"/img_*.jpg \
        -quality "$JPEG_Q" -tile ${COLS}x -geometry +0+0 \
        "$THUMBNAILS_DIR/sprite.jpg"

echo "➜  Sprite WebP…"
montage "$THUMBNAILS_DIR"/img_*.webp \
        -define webp:method=6 -define webp:quality="$WEBP_Q" \
        -tile ${COLS}x -geometry +0+0 \
        "$THUMBNAILS_DIR/sprite.webp"

############################ 3. FONCTION VTT #################################
make_vtt_multi() { # $1=dir  $2=ext  $3=vtt_out
  local dir=$1 ext=$2 vtt=$3
  { echo "WEBVTT"; echo
    ls "$dir"/img_*."$ext" | nl -v0 -w1 -nln | \
    LC_NUMERIC=C awk -v interval="$INT" -v d="$(basename "$dir")" -v e=".$ext" '{
        s=$1*interval; e=s+interval;
        printf("%02d:%02d:%02d.000 --> %02d:%02d:%02d.000\n",
               s/3600,(s/60)%60,s%60,
               e/3600,(e/60)%60,e%60);
        printf("%s/img_%05d%s\n\n",d,$1+1,e)
    }'
  } > "$vtt"
}

make_vtt_sprite() { # $1=sprite_path  $2=dir  $3=ext  $4=vtt_out
  local sprite=$1 dir=$2 ext=$3 vtt=$4
  local w h total x y row col
  read w h <<< "$(identify -format '%w %h' "$dir"/img_00001."$ext")"
  total=$(ls "$dir"/img_*."$ext" | wc -l)
  { echo "WEBVTT"; echo
    for ((i=0;i<total;i++)); do
      s=$((i*INT)); e=$((s+INT))
      row=$((i/COLS)); col=$((i%COLS))
      x=$((col*w));  y=$((row*h))
      printf "%02d:%02d:%02d.000 --> %02d:%02d:%02d.000\n" \
             $((s/3600)) $(((s/60)%60)) $((s%60)) \
             $((e/3600)) $(((e/60)%60)) $((e%60))
      echo "$(basename "$dir")/$(basename "$sprite")#xywh=$x,$y,$w,$h"; echo
    done
  } > "$vtt"
}

############################ 4. VTT ##########################################
echo "➜  VTT multiples…"
make_vtt_multi "$THUMBNAILS_DIR" jpg "$STREAM_DIR/thumbnails_jpg.vtt"
make_vtt_multi "$THUMBNAILS_DIR" webp "$STREAM_DIR/thumbnails_webp.vtt"

echo "➜  VTT sprites…"
make_vtt_sprite "$THUMBNAILS_DIR/sprite.jpg" "$THUMBNAILS_DIR" jpg "$STREAM_DIR/thumbnails_jpg_sprite.vtt"
make_vtt_sprite "$THUMBNAILS_DIR/sprite.webp" "$THUMBNAILS_DIR" webp "$STREAM_DIR/thumbnails_webp_sprite.vtt"

############################ 5. RÉCAP ########################################
cat <<EOF

✅ Thumbnails JPEG  : $THUMBNAILS_DIR/*.jpg
✅ Sprite JPEG      : $THUMBNAILS_DIR/sprite.jpg
✅ VTT multi JPEG   : $STREAM_DIR/thumbnails_jpg.vtt
✅ VTT sprite JPEG  : $STREAM_DIR/thumbnails_jpg_sprite.vtt

✅ Thumbnails WebP  : $THUMBNAILS_DIR/*.webp
✅ Sprite WebP      : $THUMBNAILS_DIR/sprite.webp
✅ VTT multi WebP   : $STREAM_DIR/thumbnails_webp.vtt
✅ VTT sprite WebP  : $STREAM_DIR/thumbnails_webp_sprite.vtt
EOF

