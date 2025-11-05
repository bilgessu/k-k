#!/bin/bash

# Script to switch between local and Replit authentication
# Usage: ./switch-auth.sh [local|replit]

if [ -z "$1" ]; then
    echo "Usage: ./switch-auth.sh [local|replit]"
    echo ""
    echo "  local   - Use local development authentication"
    echo "  replit  - Use Replit OpenID Connect authentication"
    exit 1
fi

if [ "$1" == "local" ]; then
    echo "Switching to LOCAL authentication..."
    sed -i.bak 's/from "\.\/replitAuth"/from "\.\/localAuth"/g' server/routes.ts
    echo "✓ Changed server/routes.ts to use localAuth"
    echo ""
    echo "You can now run: npm run dev"
    echo "You'll be auto-logged in as: test@local.dev"
elif [ "$1" == "replit" ]; then
    echo "Switching to REPLIT authentication..."
    sed -i.bak 's/from "\.\/localAuth"/from "\.\/replitAuth"/g' server/routes.ts
    echo "✓ Changed server/routes.ts to use replitAuth"
    echo ""
    echo "You can now deploy to Replit with proper authentication"
else
    echo "Invalid option: $1"
    echo "Use 'local' or 'replit'"
    exit 1
fi

# Clean up backup file
rm -f server/routes.ts.bak

echo ""
echo "Don't forget to restart your development server!"
