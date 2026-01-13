import re
import glob

files = glob.glob('src/app/components/erp/*.tsx')

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix table cells with just padding
    content = re.sub(
        r"<td style=\{\{ padding: '12px' \}\}>",
        r"<td style={{ padding: '12px', color: '#1e293b' }}>",
        content
    )
    
    # Fix table cells with padding and fontWeight
    content = re.sub(
        r"<td style=\{\{ padding: '12px', fontWeight: '600' \}\}>",
        r"<td style={{ padding: '12px', fontWeight: '600', color: '#1e293b' }}>",
        content
    )
    
    # Fix input boxes - add color after fontSize
    content = re.sub(
        r"fontSize: '16px'\n              }}",
        r"fontSize: '16px',\n              color: '#1e293b'\n              }}",
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✅ Fixed {filepath}")

print("\n🎉 All files fixed!")
EOF