#!/bin/bash
set -eo pipefail

prepare_frontend() {
  FRONTEND_DIR="/app/frontend/build"
  CLIENT_DIR="$FRONTEND_DIR/client"
  if [ -d "$CLIENT_DIR" ]; then
    cp -an "$CLIENT_DIR"/* "$FRONTEND_DIR"/ 2>/dev/null || true
  fi
  if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    ASSET_DIR="$FRONTEND_DIR/assets"
    JS="$(ls -1 "$ASSET_DIR"/entry.client-*.js 2>/dev/null | head -n1 || true)"
    if [ -z "$JS" ]; then
      JS="$(ls -1 "$ASSET_DIR"/root-*.js 2>/dev/null | head -n1 || true)"
    fi
    CSS="$(ls -1 "$ASSET_DIR"/root-*.css 2>/dev/null | head -n1 || true)"
    if [ -n "$JS" ]; then
      JS_BN="$(basename "$JS")"
      CSS_TAG=""
      if [ -n "$CSS" ]; then
        CSS_TAG="<link rel=\"stylesheet\" href=\"/assets/$(basename \"$CSS\")\">"
      fi
      {
        printf "%s\n" "<!doctype html>"
        printf "%s\n" "<html lang=\"en\">"
        printf "%s\n" "  <head>"
        printf "%s\n" "    <meta charset=\"utf-8\">"
        printf "%s\n" "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
        printf "%s\n" "    <title>Agent Mojo</title>"
        [ -n "$CSS_TAG" ] && printf "%s\n" "    $CSS_TAG"
        printf "%s\n" "  </head>"
        printf "%s\n" "  <body>"
        printf "%s\n" "    <div id=\"root\"></div>"
        printf "%s\n" "    <script type=\"module\" src=\"/assets/$JS_BN\"></script>"
        printf "%s\n" "  </body>"
        printf "%s\n" "</html>"
      } > "$FRONTEND_DIR/index.html"
      echo "Prepared SPA index.html -> $FRONTEND_DIR/index.html"
    else
      echo "Warning: no SPA JS entry found in $ASSET_DIR; skipping index.html generation"
    fi
  fi
}


echo "Starting OpenHands..."
if [[ $NO_SETUP == "true" ]]; then
  echo "Skipping setup, running as $(whoami)"
  prepare_frontend
  "$@"
  exit 0
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "The OpenHands entrypoint.sh must run as root"
  exit 1
fi

if [ -z "$SANDBOX_USER_ID" ]; then
  echo "SANDBOX_USER_ID is not set"
  exit 1
fi

if [ -z "$WORKSPACE_MOUNT_PATH" ]; then
  # This is set to /opt/workspace in the Dockerfile. But if the user isn't mounting, we want to unset it so that OpenHands doesn't mount at all
  unset WORKSPACE_BASE
fi

if [[ "$INSTALL_THIRD_PARTY_RUNTIMES" == "true" ]]; then
  echo "Downloading and installing third_party_runtimes..."
  echo "Warning: Third-party runtimes are provided as-is, not actively supported and may be removed in future releases."

  if pip install 'openhands-ai[third_party_runtimes]' -qqq 2> >(tee /dev/stderr); then
    echo "third_party_runtimes installed successfully."
  else
    echo "Failed to install third_party_runtimes." >&2
    exit 1
  fi
fi

if [[ "$SANDBOX_USER_ID" -eq 0 ]]; then
  echo "Running OpenHands as root"
  export RUN_AS_OPENHANDS=false
  prepare_frontend
  "$@"
else
  echo "Setting up enduser with id $SANDBOX_USER_ID"
  if id "enduser" &>/dev/null; then
    echo "User enduser already exists. Skipping creation."
  else
    if ! useradd -l -m -u $SANDBOX_USER_ID -s /bin/bash enduser; then
      echo "Failed to create user enduser with id $SANDBOX_USER_ID. Moving openhands user."
      incremented_id=$(($SANDBOX_USER_ID + 1))
      usermod -u $incremented_id openhands
      if ! useradd -l -m -u $SANDBOX_USER_ID -s /bin/bash enduser; then
        echo "Failed to create user enduser with id $SANDBOX_USER_ID for a second time. Exiting."
        exit 1
      fi
    fi
  fi
  usermod -aG app enduser
  # get the user group of /var/run/docker.sock and set openhands to that group
  DOCKER_SOCKET_GID=$(stat -c '%g' /var/run/docker.sock)
  echo "Docker socket group id: $DOCKER_SOCKET_GID"
  if getent group $DOCKER_SOCKET_GID; then
    echo "Group with id $DOCKER_SOCKET_GID already exists"
  else
    echo "Creating group with id $DOCKER_SOCKET_GID"
    groupadd -g $DOCKER_SOCKET_GID docker
  fi

  mkdir -p /home/enduser/.cache/huggingface/hub/

  usermod -aG $DOCKER_SOCKET_GID enduser
  echo "Running as enduser"
  prepare_frontend
  su enduser /bin/bash -c "${*@Q}" # This magically runs any arguments passed to the script as a command
fi
