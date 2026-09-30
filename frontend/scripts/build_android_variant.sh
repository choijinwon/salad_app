#!/usr/bin/env bash
set -euo pipefail

VARIANT="${1:-}"

if [[ "${VARIANT}" != "customer" && "${VARIANT}" != "driver" ]]; then
  echo "Usage: scripts/build_android_variant.sh customer|driver" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/android/app/build/outputs/apk/debug"
ARCHIVE_DIR="${ROOT_DIR}/build-output/apk"
APK_NAME="salad-${VARIANT}-debug.apk"
DEFAULT_JAVA_HOME="/Users/choijinwon/Library/Java/JavaVirtualMachines/openjdk-24.0.1/Contents/Home"

if [[ -z "${JAVA_HOME:-}" && -d "${DEFAULT_JAVA_HOME}" ]]; then
  export JAVA_HOME="${DEFAULT_JAVA_HOME}"
fi

cd "${ROOT_DIR}"

npm run "icons:${VARIANT}"
VITE_APP_VARIANT="${VARIANT}" npm run build
VITE_APP_VARIANT="${VARIANT}" APP_VARIANT="${VARIANT}" npx cap sync android

cd "${ROOT_DIR}/android"
APP_VARIANT="${VARIANT}" ./gradlew assembleDebug

mkdir -p "${ARCHIVE_DIR}"
cp "${OUTPUT_DIR}/app-debug.apk" "${OUTPUT_DIR}/${APK_NAME}"
cp "${OUTPUT_DIR}/app-debug.apk" "${ARCHIVE_DIR}/${APK_NAME}"
echo "${ARCHIVE_DIR}/${APK_NAME}"
