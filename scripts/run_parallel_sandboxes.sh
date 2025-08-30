#!/usr/bin/env bash
set -euo pipefail

# run_parallel_sandboxes.sh
# Launch multiple Docker containers in parallel with a read-only mount of the
# current repository. A common prompt or test script is passed to each
# container and logs are streamed to experiments/<container_id>/.
# Metadata including image name, tool versions and the current commit hash are
# stored alongside the output.

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <prompt-file> <image1> [image2 ...]" >&2
    exit 1
fi

PROMPT_FILE="$(realpath "$1")"
shift
IMAGES=("$@")

REPO_DIR="$(git rev-parse --show-toplevel)"
COMMIT_HASH="$(git rev-parse HEAD)"

mkdir -p experiments

run_container() {
    IMAGE="$1"
    # Sanitize the image name to create a container identifier
    ID="$(echo "$IMAGE" | tr '/:' '_' | tr '.' '-')"
    OUT_DIR="experiments/$ID"
    mkdir -p "$OUT_DIR"

    # Gather tool versions inside the container
    TOOL_VERSIONS=$(docker run --rm "$IMAGE" bash -lc 'vim --version 2>/dev/null | head -n 1; node --version 2>/dev/null; python --version 2>/dev/null' 2>/dev/null | tr '\n' '; ')

    cat <<META > "$OUT_DIR/metadata.json"
{
  "image": "$IMAGE",
  "commit": "$COMMIT_HASH",
  "tool_versions": "$TOOL_VERSIONS"
}
META

    # Run the container with repository mounted read-only and prompt passed in
    docker run --rm \
        --mount type=bind,source="$REPO_DIR",target=/repo,readonly \
        --mount type=bind,source="$PROMPT_FILE",target=/prompt,readonly \
        "$IMAGE" bash /prompt 2>&1 | tee "$OUT_DIR/run.log" &
}

for IMAGE in "${IMAGES[@]}"; do
    run_container "$IMAGE"
done

wait
