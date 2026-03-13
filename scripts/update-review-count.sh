#!/usr/bin/env bash
# -------------------------------------------------------------------
# update-review-count.sh
# Fetches the current Google review count via Places API (New)
# and updates it across the website source files.
#
# Usage:  ./scripts/update-review-count.sh <API_KEY> <PLACE_ID>
# Exit:   0 = files were changed,  1 = no change or error
# -------------------------------------------------------------------
set -euo pipefail

API_KEY="${1:?Missing API_KEY}"
PLACE_ID="${2:?Missing PLACE_ID}"

# ── Fetch review count from Google Places API (New) ──────────────
RESPONSE=$(curl -s -f \
  "https://places.googleapis.com/v1/places/${PLACE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: ${API_KEY}" \
  -H "X-Goog-FieldMask: userRatingCount,rating")

COUNT=$(echo "$RESPONSE" | jq -r '.userRatingCount // empty')
RATING=$(echo "$RESPONSE" | jq -r '.rating // empty')

if [[ -z "$COUNT" ]]; then
  echo "::error::Could not extract userRatingCount from API response"
  echo "Response was: $RESPONSE"
  exit 1
fi

echo "✓ Fetched from Google: rating=${RATING}, reviews=${COUNT}"

# ── Define replacement patterns ──────────────────────────────────
# Pattern A:  "N отзива"  (exact count, used on index & procedures)
# Pattern B:  "N+ отзива" (with plus sign, used on contact page)

# Files using pattern A  —  «5.0 в Google · N отзива»
SED_PATTERN_A="s/[0-9]\+ отзива/${COUNT} отзива/g"

# Files using pattern B  —  «от N+ отзива»
SED_PATTERN_B="s/[0-9]\++ отзива/${COUNT}+ отзива/g"

CHANGED=0

# ── Apply replacements ───────────────────────────────────────────
for FILE in index.html procedures.html; do
  if [[ -f "$FILE" ]]; then
    sed -i "$SED_PATTERN_A" "$FILE" && echo "  Updated $FILE (pattern A)"
  fi
done

for FILE in contact.html; do
  if [[ -f "$FILE" ]]; then
    sed -i "$SED_PATTERN_B" "$FILE" && echo "  Updated $FILE (pattern B)"
  fi
done

# translations.js has BOTH patterns
if [[ -f "assets/js/translations.js" ]]; then
  sed -i "$SED_PATTERN_A" "assets/js/translations.js"
  sed -i "$SED_PATTERN_B" "assets/js/translations.js"
  echo "  Updated translations.js (patterns A+B)"
fi

# ── Also update rating if it changed ─────────────────────────────
if [[ -n "$RATING" ]]; then
  # Update "5.0 в Google" → "{RATING} в Google" across all files
  SED_RATING="s/[0-9]\.[0-9] в Google/${RATING} в Google/g"
  for FILE in index.html procedures.html assets/js/translations.js; do
    if [[ -f "$FILE" ]]; then
      sed -i "$SED_RATING" "$FILE"
    fi
  done

  # contact.html uses "Google оценка 5.0"
  if [[ -f "contact.html" ]]; then
    sed -i "s/Google оценка [0-9]\.[0-9]/Google оценка ${RATING}/g" "contact.html"
  fi
  if [[ -f "assets/js/translations.js" ]]; then
    sed -i "s/Google оценка [0-9]\.[0-9]/Google оценка ${RATING}/g" "assets/js/translations.js"
  fi
  echo "  Updated rating to ${RATING}"
fi

# ── Check if anything actually changed ───────────────────────────
if git diff --quiet 2>/dev/null; then
  echo "ℹ No changes detected — review count is already up to date."
  exit 1
else
  echo "✓ Files updated. Review count: ${COUNT}, Rating: ${RATING}"
  exit 0
fi
