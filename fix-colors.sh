#!/bin/bash

echo "🎨 Fixing color contrasts in ERP components..."

# Determine OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_CMD="sed -i ''"
else
  SED_CMD="sed -i"
fi

# Fix table header backgrounds
echo "1️⃣ Fixing table header backgrounds..."
find src/app/components/erp -name "*.tsx" -exec $SED_CMD 's/background: '\''#f9fafb'\''/background: '\''#1e293b'\''/g' {} \;

# Fix border colors
echo "2️⃣ Fixing border colors..."
find src/app/components/erp -name "*.tsx" -exec $SED_CMD 's/borderBottom: '\''2px solid #e5e7eb'\''/borderBottom: '\''2px solid #cbd5e1'\''/g' {} \;

# Fix heading colors
echo "3️⃣ Fixing heading colors..."
find src/app/components/erp -name "*.tsx" -exec $SED_CMD 's/color: '\''#1e40af'\''/color: '\''#1e293b'\''/g' {} \;

echo "✅ Done! Colors fixed."
