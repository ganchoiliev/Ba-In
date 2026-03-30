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
echo "Fetching reviews for place: ${PLACE_ID:0:10}..."

RESPONSE=$(curl -s -w "\n%{http_code}" \
  "https://places.googleapis.com/v1/places/${PLACE_ID}" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: ${API_KEY}" \
  -H "X-Goog-FieldMask: userRatingCount,rating")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ne 200 ]]; then
  echo "::error::Google Places API returned HTTP ${HTTP_CODE}"
  echo "Response: $BODY"
  exit 1
fi

COUNT=$(echo "$BODY" | jq -r '.userRatingCount // empty')
# Ensure rating always has one decimal (e.g. 5 → 5.0)
RATING=$(echo "$BODY" | jq -r '.rating // empty')
if [[ -n "$RATING" && "$RATING" != *.* ]]; then
  RATING="${RATING}.0"
fi

if [[ -z "$COUNT" ]]; then
  echo "::error::Could not extract userRatingCount from API response"
  echo "Response was: $BODY"
  exit 1
fi

echo "✓ Fetched from Google: rating=${RATING}, reviews=${COUNT}"

# ── Bulgarian patterns ──────────────────────────────────────────
# Pattern A:  "N отзива"  (exact count — index & procedures)
# Pattern B:  "N+ отзива" (with plus sign — contact page)
SED_BG_A="s/[0-9]\+ отзива/${COUNT} отзива/g"
SED_BG_B="s/[0-9]\++ отзива/${COUNT}+ отзива/g"

# ── English patterns ────────────────────────────────────────────
# Pattern C:  "N reviews"  (exact count — index & procedures)
# Pattern D:  "N+ reviews" (with plus sign — contact page)
SED_EN_C="s/[0-9]\+ reviews/${COUNT} reviews/g"
SED_EN_D="s/[0-9]\++ reviews/${COUNT}+ reviews/g"

# ── Apply replacements to HTML files ────────────────────────────
for FILE in index.html procedures.html; do
  if [[ -f "$FILE" ]]; then
    sed -i "$SED_BG_A" "$FILE"
    echo "  Updated $FILE (BG pattern)"
  fi
done

for FILE in contact.html; do
  if [[ -f "$FILE" ]]; then
    sed -i "$SED_BG_B" "$FILE"
    echo "  Updated $FILE (BG contact pattern)"
  fi
done

# ── Apply all patterns to translations.js ───────────────────────
if [[ -f "assets/js/translations.js" ]]; then
  sed -i "$SED_BG_A" "assets/js/translations.js"
  sed -i "$SED_BG_B" "assets/js/translations.js"
  sed -i "$SED_EN_C" "assets/js/translations.js"
  sed -i "$SED_EN_D" "assets/js/translations.js"
  echo "  Updated translations.js (BG + EN patterns)"
fi

# ── Also update rating if it changed ─────────────────────────────
if [[ -n "$RATING" ]]; then
  # Bulgarian: "5.0 в Google"
  SED_RATING_BG="s/[0-9]\.[0-9] в Google/${RATING} в Google/g"
  # English: "on Google"  (rating appears before "on Google")
  SED_RATING_EN="s/[0-9]\.[0-9] on Google/${RATING} on Google/g"

  for FILE in index.html procedures.html assets/js/translations.js; do
    if [[ -f "$FILE" ]]; then
      sed -i "$SED_RATING_BG" "$FILE"
      sed -i "$SED_RATING_EN" "$FILE"
    fi
  done

  # contact.html uses "Google оценка 5.0" (BG) and "Google rating 5.0" (EN)
  if [[ -f "contact.html" ]]; then
    sed -i "s/Google оценка [0-9]\.[0-9]/Google оценка ${RATING}/g" "contact.html"
  fi
  if [[ -f "assets/js/translations.js" ]]; then
    sed -i "s/Google оценка [0-9]\.[0-9]/Google оценка ${RATING}/g" "assets/js/translations.js"
    sed -i "s/Google rating [0-9]\.[0-9]/Google rating ${RATING}/g" "assets/js/translations.js"
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
