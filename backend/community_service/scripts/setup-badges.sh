#!/bin/bash

# Change to the community service directory
cd "$(dirname "$0")/.."

# Install canvas package if not already installed
if ! npm list canvas >/dev/null 2>&1; then
  echo "Installing canvas package..."
  npm install canvas
fi

# Create public/badges directory if it doesn't exist
mkdir -p public/badges

# Run the badge generation script
echo "Generating badges..."
node scripts/create-badges.js

echo "Badge setup complete. Now restart the community service." 