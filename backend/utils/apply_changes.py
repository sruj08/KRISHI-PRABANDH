import os
import re

def main():
    frontend_dir = os.path.join('..', '..', 'frontend')
    if not os.path.exists(frontend_dir):
        print(f"Error: Frontend directory {frontend_dir} not found.")
        return

    files = [f for f in os.listdir(frontend_dir) if f.endswith('.html')]

    name_map = {
        "Officer John Doe": "Sahayak Krushi Adhikari Ramesh Patil",
        "Ramesh Kumar": "Sandeep Kadam",
        "Sunita Devi": "Savita Deshmukh",
        "Harjit Singh": "Anand Jadhav",
        "Anil Verma": "Vikas More",
        "Officer John": "Sahayak Krushi Adhikari Ramesh Patil"
    }

    lang_toggle = '<button class="lang-toggle-btn px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full font-bold text-xs shadow-sm hover:bg-surface-dim transition-colors mx-2">मराठी</button>'

    for file_name in files:
        file_path = os.path.join(frontend_dir, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
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
            
            # Mobile Header
            content = content.replace(
                '<span class="text-green-900 dark:text-green-50 font-black text-xl flex-1 text-center">AgriField Gov</span>',
                '<span class="text-green-900 dark:text-green-50 font-black text-xl flex-1 text-center">AgriField Gov</span>\n' + lang_toggle
            )
            
        # 4. Fix desktop alignment
        content = re.sub(r'max-w-4xl mx-auto w-full', 'max-w-7xl px-4 md:px-12 w-full', content)
        content = re.sub(r'max-w-4xl w-full mx-auto', 'max-w-7xl px-4 md:px-12 w-full', content)
        content = re.sub(r'w-full max-w-4xl mx-auto', 'w-full max-w-7xl px-4 md:px-12', content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"Applied translations and layout fixes to {len(files)} files in {frontend_dir}.")

if __name__ == "__main__":
    main()
