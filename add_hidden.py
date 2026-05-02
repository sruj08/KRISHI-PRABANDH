import re

files = ['index.html', 'applications.html', 'visit_planner.html', 'fraud_alerts.html', 'advanced_tools.html']

for f_path in files:
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the header element that represents the Top App Bar
    # It usually starts with <header class="...
    # We will add md:hidden to the class list if it doesn't already have it
    def add_hidden(match):
        header_tag = match.group(0)
        if 'md:hidden' not in header_tag:
            return header_tag.replace('class="', 'class="md:hidden ')
        return header_tag

    content = re.sub(r'<header class="[^"]+"[^>]*>', add_hidden, content)

    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done hiding headers")
