#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-jdbc:postgresql://localhost:15432/salad_app}"
export DATABASE_USERNAME="${DATABASE_USERNAME:-salad_app}"

if [ -z "${DATABASE_PASSWORD:-}" ]; then
  echo "DATABASE_PASSWORD is missing. Copy .env.example to .env and set DATABASE_PASSWORD." >&2
  exit 1
fi

if [ -d /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ]; then
  export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
fi

gradle bootRun
