#!/usr/bin/env bash

# Script automatique d'encodage de renditions vidéo
# Détecte automatiquement la vidéo source et génère les renditions adaptées

OUTPUT_DIR="encoded_renditions"
mkdir -p "$OUTPUT_DIR"

# Fonction pour obtenir les infos de la vidéo source
get_source_info() {
    local file="$1"
    
    width=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=width -of csv=p=0 "$file" 2>/dev/null)
    height=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=height -of csv=p=0 "$file" 2>/dev/null)

    fps_raw=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$file" 2>/dev/null)
    if [[ "$fps_raw" =~ ^([0-9]+)/([0-9]+)$ ]]; then
        fps=$(echo "scale=2; ${BASH_REMATCH[1]} / ${BASH_REMATCH[2]}" | bc)
    else
        fps="$fps_raw"
    fi

    video_codec=$(ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$file" 2>/dev/null)
    audio_codec=$(ffprobe -v quiet -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$file" 2>/dev/null)
    audio_channels=$(ffprobe -v quiet -select_streams a:0 -show_entries stream=channels -of csv=p=0 "$file" 2>/dev/null)

    echo "$width,$height,$fps,$video_codec,$audio_codec,$audio_channels"
}

# Fonction pour calculer les renditions adaptées
calculate_renditions() {
    local source_width="$1"
    local source_height="$2"
    local fps="$3"

    local gop_seconds=3
    local fps_numeric=$(echo "$fps" | awk '{print $1}')
    local keyint=$(echo "$fps_numeric * $gop_seconds" | bc | cut -d. -f1)

    if ! [[ "$keyint" =~ ^[0-9]+$ ]] || [[ -z "$keyint" ]]; then
        echo "Avertissement : Impossible de calculer keyint à partir de fps='$fps'. Utilisation d'une valeur par défaut de 72." >&2
        keyint=72
    fi

    echo "📐 Résolution source : ${source_width}x${source_height}" >&2
    echo "🎬 Framerate : ${fps} fps (numérique pour calcul: $fps_numeric)" >&2
    echo "🔑 GOP size : $keyint frames (${gop_seconds}s)" >&2
    echo "" >&2

    local renditions_array=()
    local added_source_resolution=false

    # Table des hauteurs standards pour les renditions cibles et leurs bitrates/profils typiques
    # Format: "target_height:video_bitrate:max_rate:buf_size:profile:level"
    # La largeur sera calculée pour maintenir le ratio d'aspect.
    # Note: On utilise -2 pour la largeur afin que ffmpeg la calcule.
    # Pour le nom de fichier, on calculera la largeur exacte plus tard.
    local standard_renditions_params=(
        "1080:6000k:9000k:12000k:high:4.2"
        "720:3000k:4500k:6000k:main:4.0"
        "540:2000k:3000k:4000k:main:3.1"
        "480:1000k:1500k:2000k:main:3.1"
        "360:600k:900k:1200k:baseline:3.0"
        "240:400k:600k:800k:baseline:3.0"
    )

    # 1. Ajouter la résolution source si elle est suffisamment grande
    #    On peut ajuster le bitrate pour la source en fonction de sa taille.
    #    Exemple de bitrates pour la résolution source :
    local source_video_bitrate="5000k"
    local source_max_rate="7500k"
    local source_buf_size="10000k"
    local source_profile="main"
    local source_level="4.0"

    if [[ "$source_height" -ge 240 ]]; then # Un seuil minimal pour la résolution source
        renditions_array+=("${source_width}:${source_height}:${source_video_bitrate}:${source_max_rate}:${source_buf_size}:${source_profile}:${source_level}")
        added_source_resolution=true
    fi

    # 2. Ajouter des renditions standards inférieures à la résolution source
    for params_str in "${standard_renditions_params[@]}"; do
        IFS=':' read -r target_h v_bitrate max_r buf_s prof lvl <<< "$params_str"

        # N'ajouter que si target_h est strictement inférieure à la hauteur source
        # ET si la résolution source a déjà été ajoutée (pour éviter les doublons exacts si la source est standard)
        # OU si la résolution source n'a pas été ajoutée (ex: source < 240p) et target_h est <= source_height
        if [[ "$target_h" -lt "$source_height" ]]; then
            # Calculer la largeur pour maintenir le ratio d'aspect
            # width = source_width * (target_h / source_height)
            # Utiliser bc pour les calculs en virgule flottante et arrondir à l'entier pair le plus proche (pour H.264)
            local target_w=$(echo "scale=0; (${source_width} * ${target_h} / ${source_height}) / 2 * 2" | bc)

            # S'assurer que target_w n'est pas 0 si target_h est très petit
            if [[ "$target_w" -lt 2 ]]; then target_w=2; fi

            # Éviter d'ajouter une rendition si elle est trop proche d'une déjà ajoutée ou trop petite
            # (logique plus avancée pourrait être ajoutée ici)

            renditions_array+=("${target_w}:${target_h}:${v_bitrate}:${max_r}:${buf_s}:${prof}:${lvl}")
        elif [[ "$added_source_resolution" = false && "$target_h" -le "$source_height" ]]; then
            # Cas où la source était trop petite pour être ajoutée, on ajoute la plus grande rendition standard possible
             local target_w=$(echo "scale=0; (${source_width} * ${target_h} / ${source_height}) / 2 * 2" | bc)
             if [[ "$target_w" -lt 2 ]]; then target_w=2; fi
             renditions_array+=("${target_w}:${target_h}:${v_bitrate}:${max_r}:${buf_s}:${prof}:${lvl}")
             break # On a trouvé la meilleure rendition standard pour une petite source
        fi
    done

    # S'il n'y a toujours aucune rendition (cas d'une source très petite et aucun standard ne correspondait)
    # On force au moins la résolution source (si elle n'a pas été ajoutée) ou une rendition minimale.
    if [[ ${#renditions_array[@]} -eq 0 ]]; then
        if [[ "$added_source_resolution" = false && "$source_height" -ge 144 ]]; then # Un seuil encore plus bas
            local target_w_fallback=$(echo "scale=0; (${source_width} * ${source_height} / ${source_height}) / 2 * 2" | bc) # = source_width arrondi
             if [[ "$target_w_fallback" -lt 2 ]]; then target_w_fallback=2; fi
            renditions_array+=("${target_w_fallback}:${source_height}:300k:450k:600k:baseline:3.0") # Bitrates très bas
        else # Fallback ultime
            renditions_array+=("320:240:300k:450k:600k:baseline:3.0") # Si tout échoue, une petite rendition standard
        fi
         echo "Avertissement: Peu de renditions générées, source peut-être très petite ou paramètres inattendus." >&2
    fi


    # Supprimer les renditions en double (basé sur la hauteur, une simplification)
    # Cela peut arriver si la résolution source est très proche d'un standard.
    # Une méthode plus robuste vérifierait width ET height.
    local unique_renditions_array=()
    declare -A seen_heights # Tableau associatif pour suivre les hauteurs vues

    for rendition_item in "${renditions_array[@]}"; do
        IFS=':' read -r r_w r_h _ <<< "$rendition_item" # On ne s'intéresse qu'à la hauteur ici pour la déduplication
        if [[ -z "${seen_heights[$r_h]}" ]]; then
            unique_renditions_array+=("$rendition_item")
            seen_heights["$r_h"]=1
        fi
    done

    # S'il ne reste qu'une seule rendition et que ce n'est pas la source (ou si la source était trop petite),
    # cela peut indiquer un problème. On s'assure que la source est là si elle est raisonnable.
    if [[ ${#unique_renditions_array[@]} -le 1 && "$added_source_resolution" = true ]]; then
        local source_already_present=false
        for item in "${unique_renditions_array[@]}"; do
            IFS=':' read -r cur_w cur_h _ <<< "$item"
            if [[ "$cur_w" -eq "$source_width" && "$cur_h" -eq "$source_height" ]]; then
                source_already_present=true
                break
            fi
        done
        if [[ "$source_already_present" = false ]]; then
             echo "Info: Ajout forcé de la résolution source car peu de renditions uniques." >&2
             # Ajoute la rendition source au début si elle n'y est pas
             unique_renditions_array=("${source_width}:${source_height}:${source_video_bitrate}:${source_max_rate}:${source_buf_size}:${source_profile}:${source_level}" "${unique_renditions_array[@]}")
        fi
    fi


    echo "$keyint ${unique_renditions_array[@]}"
}

# Fonction d'encodage d'une rendition
encode_rendition() {
    local input_file="$1"
    local width="$2"
    local height="$3"
    local bitrate="$4"
    local maxrate="$5"
    local bufsize="$6"
    local profile="$7"
    local level="$8"
    local keyint="$9"
    local output_file="${10}"

    echo "🎥 Encodage ${width}x${height} @ ${bitrate}..." >&2 # Message utilisateur vers stderr

    local scale_filter
    if [[ "$width" == "-2" || "$height" == "-2" ]]; then
        scale_filter="scale=${width}:${height}"
    else
        if ! [[ "$width" =~ ^[0-9]+$ ]] || ! [[ "$height" =~ ^[0-9]+$ ]]; then
            echo "❌ Erreur: Largeur ($width) ou hauteur ($height) invalide pour dimensions fixes." >&2
            return 1
        fi
        scale_filter="scale=w=${width}:h=${height}"
    fi

    ffmpeg -i "$input_file" -y \
        -vf "$scale_filter" \
        -c:v libx264 -profile:v "$profile" -level:v "$level" \
        -x264-params "scenecut=0:open_gop=0:min-keyint=${keyint}:keyint=${keyint}" \
        -minrate "$bitrate" -maxrate "$maxrate" -bufsize "$bufsize" -b:v "$bitrate" \
        -c:a copy \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        "$output_file" || {
            echo "❌ Erreur lors de l'encodage $output_file" >&2
            return 1
        }

    echo "✅ $output_file créé avec succès" >&2 # Message utilisateur vers stderr
}

# Fonction d'encodage audio
encode_audio() {
    local input_file="$1"
    local codec="$2"
    local channels="$3"

    local audio_bitrate
    case "$channels" in
        1) audio_bitrate="96k" ;;
        2) audio_bitrate="128k" ;;
        6) audio_bitrate="256k" ;;
        8) audio_bitrate="384k" ;;
        *) audio_bitrate="128k" ;;
    esac

    echo "🔊 Encodage audio ${codec} ${channels} canaux @ ${audio_bitrate}..." >&2 # Message utilisateur vers stderr

    if ! [[ "$channels" =~ ^[0-9]+$ ]]; then
        echo "Avertissement: Nombre de canaux audio invalide ('$channels'). Utilisation de 2 par défaut." >&2
        channels=2
    fi

    ffmpeg -i "$input_file" -y \
        -vn \
        -c:a aac -b:a "$audio_bitrate" -ar 48000 -ac "$channels" \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        "$OUTPUT_DIR/audio_fr_${audio_bitrate%k}k.mp4" || {
            echo "❌ Erreur lors de l'encodage audio" >&2
            return 1
        }

    echo "✅ Fichier audio créé avec succès" >&2 # Message utilisateur vers stderr
}

# Script principal
# Les echos ici sont pour l'utilisateur, donc pas besoin de >&2 sauf si vous capturez la sortie du script entier.
echo "🎬 === ENCODAGE AUTOMATIQUE DE RENDITIONS VIDÉO ==="
echo ""

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

for cmd in ffmpeg ffprobe bc; do
    if ! command -v "$cmd" &> /dev/null; then
        echo "❌ Erreur : La commande '$cmd' n'est pas installée ou non accessible dans le PATH."
        exit 1
    fi
done

echo "🔍 Analyse de '$INPUT_FILE'..."

info=$(get_source_info "$INPUT_FILE")
IFS=',' read -r source_width source_height fps video_codec audio_codec audio_channels <<< "$info"

if [[ -z "$source_width" || -z "$source_height" || -z "$fps" ]]; then
    echo "❌ Erreur: Impossible de récupérer les informations de base (dimensions, fps) de '$INPUT_FILE'."
    echo "   Vérifiez que le fichier est une vidéo valide et que ffprobe fonctionne correctement."
    exit 1
fi

echo "📊 Informations détectées :"
echo "  ├─ Dimensions : ${source_width}x${source_height}"
echo "  ├─ Framerate : ${fps} fps"
echo "  ├─ Codec vidéo : $video_codec"
echo "  ├─ Codec audio : $audio_codec"
echo "  └─ Canaux audio : $audio_channels"
echo ""

renditions_data=$(calculate_renditions "$source_width" "$source_height" "$fps")

if [[ -z "$renditions_data" ]]; then
    echo "❌ Erreur: Aucune donnée de rendition retournée par calculate_renditions."
    exit 1
fi

read -r -a all_data_array <<< "$renditions_data"

if [[ ${#all_data_array[@]} -lt 1 ]]; then
    echo "❌ Erreur: Données de rendition invalides ou vides après le parsing."
    echo "   renditions_data: '$renditions_data'"
    exit 1
fi

keyint="${all_data_array[0]}"
renditions_strings_array=("${all_data_array[@]:1}")

if ! [[ "$keyint" =~ ^[0-9]+$ ]] || [[ -z "$keyint" ]]; then # Vérification après l'assignation de keyint
    echo "❌ Erreur: keyint ('$keyint') n'est pas un nombre valide. Vérifiez la fonction calculate_renditions."
    exit 1
fi

echo "🚀 Début de l'encodage..."
echo ""

success_count=0
# S'il n'y a pas de renditions vidéo, total_count sera juste 1 (pour l'audio)
# S'il y a des renditions, total_count = nombre de renditions + 1 (pour l'audio)
if [[ ${#renditions_strings_array[@]} -eq 0 && "$keyint" == "0" ]]; then # Cas où calculate_renditions n'a rien produit d'utile
    total_count=1 # On essaiera quand même l'audio
    echo "Avertissement: Aucune rendition vidéo à générer. Seul l'audio sera traité." >&2
else
    total_count=$((${#renditions_strings_array[@]} + 1))
fi


for rendition_str in "${renditions_strings_array[@]}"; do
    IFS=':' read -r width height bitrate maxrate bufsize profile level <<< "$rendition_str"

    if [[ -z "$width" || -z "$height" || -z "$bitrate" || -z "$profile" || -z "$level" ]]; then
        echo "⚠️  Avertissement: Parsing incomplet pour la rendition '$rendition_str'. Sautée." >&2
        echo "   width='$width', height='$height', bitrate='$bitrate', profile='$profile', level='$level'" >&2
        total_count=$((total_count - 1))
        continue
    fi

    filename_width="$width"
    filename_height="$height"
    if [[ "$width" == "-2" ]]; then
      filename_width="autoW"
    fi
    if [[ "$height" == "-2" ]]; then
      filename_height="autoH"
    fi
    output_file="$OUTPUT_DIR/video_${filename_width}x${filename_height}_${bitrate%k}k.mp4"

    if encode_rendition "$INPUT_FILE" "$width" "$height" "$bitrate" "$maxrate" "$bufsize" "$profile" "$level" "$keyint" "$output_file"; then
        ((success_count++))
    fi
    echo "" >&2 # Ligne vide pour l'affichage utilisateur
done

echo "🎵 Encodage de la piste audio..." >&2 # Message utilisateur vers stderr
if encode_audio "$INPUT_FILE" "$audio_codec" "$audio_channels"; then
    ((success_count++))
else
    echo "❌ L'encodage audio a échoué." >&2
fi

echo "" # Ligne vide pour l'affichage
echo "📊 === RÉSUMÉ ==="
if [[ $total_count -le 0 ]]; then # Changé pour -le 0 car total_count pourrait devenir négatif si trop de sauts
    echo "Aucune tâche d'encodage n'a été tentée ou valide."
else
    echo "✅ Encodages réussis : $success_count/$total_count"
fi
echo "📁 Fichiers générés dans : $OUTPUT_DIR/"
echo ""

if [[ $success_count -eq $total_count && $total_count -gt 0 ]]; then
    echo "🎉 Encodage terminé avec succès !"
    echo "💡 Vous pouvez maintenant exécuter package_streams.sh"
else
    if [[ $total_count -le 0 ]]; then
        echo "⚠️ Aucune opération d'encodage valide à effectuer."
    else
        local failed_encodes=$((total_count - success_count))
        # Ne pas afficher d'erreur si failed_encodes est 0 (tout a réussi)
        if [[ $failed_encodes -gt 0 ]]; then
            echo "⚠️  Certains encodages ont échoué ($failed_encodes erreur(s))"
        fi
    fi
    # Ne sortir avec une erreur que si qqch a échoué ET qu'il y avait des tâches à faire
    if [[ $success_count -ne $total_count || $total_count -le 0 ]]; then
        exit 1
    fi
fi
