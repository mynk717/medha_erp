#!/bin/bash

echo "🔧 Adding white text to table headers..."

# Files to fix
FILES=(
  "src/app/components/erp/Sales.tsx"
  "src/app/components/erp/Purchases.tsx"
  "src/app/components/erp/Inventory.tsx"
  "src/app/components/erp/Bills.tsx"
  "src/app/components/erp/Dashboard.tsx"
  "src/app/components/erp/Invoices.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Pattern 1: Add color and fontWeight to th elements
    sed -i.bak "s/textAlign: 'left', borderBottom:/textAlign: 'left', color: '#ffffff', fontWeight: 700, borderBottom:/g" "$file"
    
    # Pattern 2: For th without textAlign (some might have padding first)
    sed -i.bak "s/padding: '12px', borderBottom:/padding: '12px', color: '#ffffff', fontWeight: 700, borderBottom:/g" "$file"
    
    # Remove backup file
    rm -f "$file.bak"
    
    echo "✅ $file fixed"
  else
    echo "⚠️  $file not found"
  fi
done

echo "🎉 All table headers fixed!"
