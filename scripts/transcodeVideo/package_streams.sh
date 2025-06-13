#!/usr/bin/env bash

ENCODED_DIR="encoded_renditions"
OUTPUT_STREAM_DIR="streaming_output"
mkdir -p "$OUTPUT_STREAM_DIR"

# Durée des segments en secondes
SEGMENT_DURATION=3

# Audio language is not detected by ffprobe, forced to "fr" for now

# Fonction pour obtenir les infos d'un fichier via ffprobe
get_file_info() {
    local file="$1"
    local stream_type="$2"  # video ou audio

    if [[ "$stream_type" == "video" ]]; then
        # Récupère largeur, hauteur et bitrate pour vidéo
        width=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=width -of csv=p=0 "$file" 2>/dev/null)
        height=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=height -of csv=p=0 "$file" 2>/dev/null)
        bitrate=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=bit_rate -of csv=p=0 "$file" 2>/dev/null)

        # Si bitrate pas disponible, essaie le bitrate total
        if [[ -z "$bitrate" || "$bitrate" == "N/A" ]]; then
            bitrate=$(ffprobe -v quiet -show_entries format=bit_rate -of csv=p=0 "$file" 2>/dev/null)
            bitrate=$((bitrate * 80 / 100))  # Estimation: 80% pour vidéo
        fi

        echo "${width}x${height},${bitrate},${height}p"

    elif [[ "$stream_type" == "audio" ]]; then
        # Récupère bitrate, langue, codec et canaux pour audio
        bitrate=$(ffprobe -v quiet -select_streams a:0 -show_entries stream=bit_rate -of csv=p=0 "$file" 2>/dev/null)
        language="fr" #$(ffprobe -v quiet -select_streams a:0 -show_entries stream_tags=language -of csv=p=0 "$file" 2>/dev/null)
        codec=$(ffprobe -v quiet -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$file" 2>/dev/null)
        channels=$(ffprobe -v quiet -select_streams a:0 -show_entries stream=channels -of csv=p=0 "$file" 2>/dev/null)

        # Valeurs par défaut si non détectées
        [[ -z "$bitrate" || "$bitrate" == "N/A" ]] && bitrate="128000"
        [[ -z "$language" || "$language" == "N/A" ]] && language="fr"
        [[ -z "$codec" || "$codec" == "N/A" ]] && codec="aac"
        [[ -z "$channels" || "$channels" == "N/A" ]] && channels="2"

        # Génère le group_id basé sur le codec et le nombre de canaux
        case "$channels" in
            1) channel_type="mono" ;;
            2) channel_type="stereo" ;;
            6) channel_type="5.1" ;;
            8) channel_type="7.1" ;;
            *) channel_type="multi" ;;
        esac
        
        group_id="${codec}_${channel_type}"

        # Convertit bitrate en kbps
        bitrate_k=$((bitrate / 1000))

        echo "${bitrate_k},${language},${group_id}"
    fi
}

echo "🔍 Analyse des fichiers dans $ENCODED_DIR..."

# Vérification que le dossier existe
if [[ ! -d "$ENCODED_DIR" ]]; then
    echo "❌ Erreur: Le dossier $ENCODED_DIR n'existe pas"
    exit 1
fi

# Vérification que ffprobe est disponible
if ! command -v ffprobe &> /dev/null; then
    echo "❌ Erreur: ffprobe n'est pas installé (requis pour l'analyse automatique)"
    echo "💡 Installez ffmpeg: sudo apt install ffmpeg"
    exit 1
fi

# Arrays pour stocker les streams
video_streams=()
audio_streams=()

# Parcours des fichiers MP4 dans le dossier
for file in "$ENCODED_DIR"/*.mp4; do
    [[ ! -f "$file" ]] && continue

    filename=$(basename "$file")
    echo "📹 Analyse de $filename..."

    # Détermine le type de stream basé sur le nom du fichier
    if [[ "$filename" =~ video_ ]]; then
        # Fichier vidéo
        info=$(get_file_info "$file" "video")
        IFS=',' read -r resolution bitrate quality_label <<< "$info"

        if [[ -n "$resolution" && -n "$bitrate" ]]; then
            output_name="video_${quality_label}.mp4"
            playlist_name="video_${quality_label}.m3u8"

            stream_def="in=/media/$ENCODED_DIR/$filename,stream=video,output=/media/$OUTPUT_STREAM_DIR/$output_name,playlist_name=$playlist_name,hls_group_id=video_main"
            video_streams+=("$stream_def")

            echo "  ├─ Résolution: $resolution"
            echo "  ├─ Bitrate: $((bitrate/1000))k"
            echo "  └─ Qualité: $quality_label"
        fi

    elif [[ "$filename" =~ audio_ ]]; then
        # Fichier audio
        info=$(get_file_info "$file" "audio")
        IFS=',' read -r bitrate_k language group_id <<< "$info"

        if [[ -n "$bitrate_k" && -n "$language" ]]; then
            output_name="audio_${language}_${bitrate_k}k.mp4"
            playlist_name="audio_${language}_${bitrate_k}k.m3u8"
            lang_display=$([ "$language" = "fr" ] && echo "Français" || echo "$language")

            stream_def="in=/media/$ENCODED_DIR/$filename,stream=audio,output=/media/$OUTPUT_STREAM_DIR/$output_name,playlist_name=$playlist_name,hls_group_id=$group_id,hls_name=$lang_display,language=$language,dash_role=main"
            audio_streams+=("$stream_def")

            echo "  ├─ Bitrate: ${bitrate_k}k"
            echo "  ├─ Codec: $group_id"
            echo "  └─ Langue: $lang_display"
        fi
    fi
done

# Vérification qu'on a trouvé des streams
total_streams=$((${#video_streams[@]} + ${#audio_streams[@]}))
if [[ $total_streams -eq 0 ]]; then
    echo "❌ Aucun fichier vidéo/audio trouvé dans $ENCODED_DIR"
    echo "💡 Les fichiers doivent commencer par 'video_' ou 'audio_'"
    exit 1
fi

echo ""
echo "📦 Génération des streams HLS/DASH..."
echo "   📺 Streams vidéo: ${#video_streams[@]}"
echo "   🔊 Streams audio: ${#audio_streams[@]}"
echo ""

# Construction de la commande Docker Shaka Packager
cmd=(
    "docker" "run" "--rm"
    "--user" "$(id -u):$(id -g)"
    "-v" "$(pwd):/media"
    "google/shaka-packager"
    "packager"
)

# Ajout des streams vidéo
for stream in "${video_streams[@]}"; do
    cmd+=("$stream")
done

# Ajout des streams audio
for stream in "${audio_streams[@]}"; do
    cmd+=("$stream")
done

# Ajout des options globales
cmd+=(
    "--mpd_output" "/media/$OUTPUT_STREAM_DIR/manifest.mpd"
    "--hls_master_playlist_output" "/media/$OUTPUT_STREAM_DIR/master.m3u8"
    "--segment_duration" "$SEGMENT_DURATION"
    "--fragment_duration" "$SEGMENT_DURATION"
    "--generate_static_live_mpd"
)

# Exécution de la commande
echo "🚀 Exécution du packaging..."
"${cmd[@]}"

# Vérification du résultat
if [[ $? -eq 0 ]]; then
    echo ""
    echo "✅ Packaging HLS et DASH terminé avec succès!"
    echo "📁 Fichiers de streaming dans : $OUTPUT_STREAM_DIR"
    echo "🎬 Manifeste DASH : $OUTPUT_STREAM_DIR/manifest.mpd"
    echo "📺 Manifeste Maître HLS : $OUTPUT_STREAM_DIR/master.m3u8"
    echo ""
    echo "📊 Streams générés :"
    ls -la "$OUTPUT_STREAM_DIR"/*.{mp4,m3u8,mpd} 2>/dev/null | while read -r line; do
        echo "   $line"
    done
else
    echo "❌ Erreur lors du packaging"
    exit 1
fi