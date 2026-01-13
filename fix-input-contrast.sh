#!/bin/bash

echo "🔧 Fixing input label and text contrast..."

FILES=(
  "src/app/components/erp/Sales.tsx"
  "src/app/components/erp/Purchases.tsx"
  "src/app/components/erp/Inventory.tsx"
  "src/app/components/erp/Bills.tsx"
  "src/app/components/erp/Settings.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix label colors - change any light gray to dark
    sed -i.bak "s/color: '#64748b'/color: '#1e293b'/g" "$file"
    sed -i.bak "s/color: '#94a3b8'/color: '#1e293b'/g" "$file"
    
    # Fix input border colors for better visibility
    sed -i.bak "s/border: '2px solid #e2e8f0'/border: '2px solid #cbd5e1'/g" "$file"
    sed -i.bak "s/border: '1px solid #e2e8f0'/border: '1px solid #cbd5e1'/g" "$file"
    
    # Add explicit color to inputs (if not present)
    sed -i.bak "s/fontSize: '16px'/fontSize: '16px', color: '#1e293b'/g" "$file"
    
    # Fix any remaining light text
    sed -i.bak "s/color: '#cbd5e1'/color: '#475569'/g" "$file"
    
    rm -f "$file.bak"
    
    echo "✅ $file fixed"
  fi
done

echo "🎉 Input contrast fixed!"
