
cd "$(dirname "$0")/.."

if ! npm list canvas >/dev/null 2>&1; then
  echo "Installing canvas package..."
  npm install canvas
fi

mkdir -p public/badges

echo "Generating badges..."
node scripts/create-badges.js

echo "Badge setup complete. Now restart the community service." 