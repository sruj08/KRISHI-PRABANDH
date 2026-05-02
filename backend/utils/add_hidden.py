import re
import os

def main():
    frontend_dir = os.path.join('..', '..', 'frontend')
    files = ['index.html', 'applications.html', 'visit_planner.html', 'fraud_alerts.html', 'advanced_tools.html']

    for f_name in files:
        f_path = os.path.join(frontend_dir, f_name)
        if not os.path.exists(f_path):
            continue
            
        with open(f_path, 'r', encoding='utf-8') as f:
            content = f.read()

        def add_hidden(match):
            header_tag = match.group(0)
            if 'md:hidden' not in header_tag:
                return header_tag.replace('class="', 'class="md:hidden ')
            return header_tag

        content = re.sub(r'<header class="[^"]+"[^>]*>', add_hidden, content)

        with open(f_path, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"Done hiding headers in {frontend_dir}")

if __name__ == "__main__":
    main()
