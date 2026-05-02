import os
import re

files = [f for f in os.listdir('.') if f.endswith('.html')]

name_map = {
    "Officer John Doe": "Sahayak Krushi Adhikari Ramesh Patil",
    "Ramesh Kumar": "Sandeep Kadam",
    "Sunita Devi": "Savita Deshmukh",
    "Harjit Singh": "Anand Jadhav",
    "Anil Verma": "Vikas More",
    "Officer John": "Sahayak Krushi Adhikari Ramesh Patil"
}

lang_toggle = '<button class="lang-toggle-btn px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full font-bold text-xs shadow-sm hover:bg-surface-dim transition-colors mx-2">मराठी</button>'

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Names
    for k, v in name_map.items():
        content = content.replace(k, v)
        
    # 2. Add <script src="./src/i18n.js"></script>
    if '<script src="./src/i18n.js"></script>' not in content:
        if '<script src="./src/main.js"></script>' in content:
            content = content.replace('<script src="./src/main.js"></script>', '<script src="./src/i18n.js"></script>\n<script src="./src/main.js"></script>')
        else:
            content = content.replace('</body>', '<script src="./src/i18n.js"></script>\n</body>')
            
    # 3. Add lang toggle
    if 'lang-toggle-btn' not in content:
        # Desktop Sidebar (above logout)
        content = content.replace(
            '<div class="p-4 border-t border-surface-variant">',
            f'<div class="p-4 border-t border-surface-variant flex flex-col gap-2">\n<div class="flex justify-between items-center px-4"><span class="text-sm font-bold text-neutral-500">Language</span>{lang_toggle}</div>\n'
        )
        
        # Mobile Header (right before the title so it flexes nicely, or after title)
        content = content.replace(
            '<span class="text-green-900 dark:text-green-50 font-black text-xl flex-1 text-center">AgriField Gov</span>',
            '<span class="text-green-900 dark:text-green-50 font-black text-xl flex-1 text-center">AgriField Gov</span>\n' + lang_toggle
        )
        
    # 4. Fix desktop alignment
    # Changing max-w-4xl mx-auto to max-w-7xl px-4 md:px-12
    # Be careful, index.html might have `max-w-4xl mx-auto w-full`
    content = re.sub(r'max-w-4xl mx-auto w-full', 'max-w-7xl px-4 md:px-12 w-full', content)
    content = re.sub(r'max-w-4xl w-full mx-auto', 'max-w-7xl px-4 md:px-12 w-full', content)
    content = re.sub(r'w-full max-w-4xl mx-auto', 'w-full max-w-7xl px-4 md:px-12', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Applied translations and layout fixes.")
