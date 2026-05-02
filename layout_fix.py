import re
import os

sidebar_template = """<!-- Mobile Drawer Container (Hidden by default, assumed handled by JS normally) -->
<aside class="hidden md:flex bg-white dark:bg-neutral-900 h-full w-80 border-r-2 border-neutral-200 dark:border-neutral-800 shadow-xl flex-col gap-2 pt-4 fixed left-0 top-0 z-40">
<div class="px-4 pb-4 border-b border-surface-variant flex items-center gap-4">
<img alt="Officer Profile Picture" class="w-12 h-12 rounded-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8jwtjd46zsWZtU1VB0LANxdRYDSmyN-nB8zCsyg3L1f5HE15UrmgOZg4dO-6LKJIJ8DYObRHmsDrV2fZ7S4cI5EyhITLQSgtX1452DCAt4A4RR4SUFKyuiw54W2HfiBDYAcI9HcOZqIwnkycUpWcZDYQrJj1k3NwYOiBJmPcVTVBKwTVcFFNVbUhBTXboR1DHMjMLM-3gm6grrCnITmzbf2FLKFVErlC-PzbLbFDJo8clxNL8MWS-rkotCU71C5UxXdZuWu-hkm8"/>
<div>
<div class="font-headline-md text-headline-md text-primary-container">Officer John Doe</div>
<div class="font-body-md text-body-md text-on-surface-variant">ID: AGRI-9920</div>
<div class="font-label-bold text-label-bold text-on-surface-variant">Region: North Sector</div>
</div>
</div>
<nav class="flex-1 mt-4">
<a class="flex items-center gap-4 px-4 py-3 text-neutral-700 dark:text-neutral-300 mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors {active_dashboard}" href="index.html">
<span class="material-symbols-outlined">home_work</span>
<span class="font-body-md text-body-md">Dashboard</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-neutral-700 dark:text-neutral-300 mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors {active_applications}" href="applications.html">
<span class="material-symbols-outlined">assignment_turned_in</span>
<span class="font-body-md text-body-md">Applications</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-neutral-700 dark:text-neutral-300 mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors {active_planner}" href="visit_planner.html">
<span class="material-symbols-outlined">calendar_today</span>
<span class="font-body-md text-body-md">Planner</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-neutral-700 dark:text-neutral-300 mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors {active_alerts}" href="fraud_alerts.html">
<span class="material-symbols-outlined">report_problem</span>
<span class="font-body-md text-body-md">Alerts</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 text-neutral-700 dark:text-neutral-300 mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors {active_tools}" href="advanced_tools.html">
<span class="material-symbols-outlined">construction</span>
<span class="font-body-md text-body-md">Advanced Tools</span>
</a>
</nav>
<div class="p-4 border-t border-surface-variant">
<a class="flex items-center gap-4 px-4 py-3 text-neutral-700 dark:text-neutral-300 mx-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" href="login.html">
<span class="material-symbols-outlined">logout</span>
<span class="font-body-md text-body-md">Logout</span>
</a>
</div>
</aside>
<div class="flex-1 md:ml-80 flex flex-col w-full pb-20 md:pb-0">
"""

bottom_nav_template = """<nav class="bg-white dark:bg-neutral-900 border-t-2 border-neutral-200 dark:border-neutral-800 h-20 fixed bottom-0 w-full z-50 flex justify-around items-center px-2 md:hidden">
<a class="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 active:scale-95 transition-transform duration-100 rounded-lg {b_active_dashboard}" href="index.html">
<span class="material-symbols-outlined">home_work</span>
<span class="font-public-sans font-semibold text-[12px]">Dashboard</span>
</a>
<a class="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 active:scale-95 transition-transform duration-100 rounded-lg {b_active_applications}" href="applications.html">
<span class="material-symbols-outlined">assignment_turned_in</span>
<span class="font-public-sans font-semibold text-[12px]">Applications</span>
</a>
<a class="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 active:scale-95 transition-transform duration-100 rounded-lg {b_active_planner}" href="visit_planner.html">
<span class="material-symbols-outlined">calendar_today</span>
<span class="font-public-sans font-semibold text-[12px]">Planner</span>
</a>
<a class="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 active:scale-95 transition-transform duration-100 rounded-lg {b_active_alerts}" href="fraud_alerts.html">
<span class="material-symbols-outlined">report_problem</span>
<span class="font-public-sans font-semibold text-[12px]">Alerts</span>
</a>
<a class="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 active:scale-95 transition-transform duration-100 rounded-lg {b_active_tools}" href="advanced_tools.html">
<span class="material-symbols-outlined">construction</span>
<span class="font-public-sans font-semibold text-[12px]">Tools</span>
</a>
</nav>
</div>
</body>
</html>
"""

def replace_nav(file_path, active_tab):
    if not os.path.exists(file_path):
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine active classes
    s_active = "bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 font-bold"
    b_active = "bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 font-bold"

    s_vars = {
        "active_dashboard": s_active if active_tab == "dashboard" else "",
        "active_applications": s_active if active_tab == "applications" else "",
        "active_planner": s_active if active_tab == "planner" else "",
        "active_alerts": s_active if active_tab == "alerts" else "",
        "active_tools": s_active if active_tab == "tools" else ""
    }

    b_vars = {
        "b_active_dashboard": b_active if active_tab == "dashboard" else "",
        "b_active_applications": b_active if active_tab == "applications" else "",
        "b_active_planner": b_active if active_tab == "planner" else "",
        "b_active_alerts": b_active if active_tab == "alerts" else "",
        "b_active_tools": b_active if active_tab == "tools" else ""
    }

    # Replace <aside> or insert it.
    # First, let's remove existing <aside>
    content = re.sub(r'<aside.*?</aside>', '', content, flags=re.DOTALL)
    
    # Remove existing <nav ... fixed bottom-0 ...>
    content = re.sub(r'<nav[^>]*bottom-0.*?</nav>', '', content, flags=re.DOTALL)
    
    # Remove existing <nav ... md:hidden ...>
    content = re.sub(r'<nav class="md:hidden.*?</nav>', '', content, flags=re.DOTALL)
    
    # Also remove </div></body></html> at the end if it exists
    content = re.sub(r'</div>\s*</body>\s*</html>', '', content, flags=re.DOTALL)
    content = re.sub(r'</body>\s*</html>', '', content, flags=re.DOTALL)

    # Insert sidebar after <body>
    sidebar = sidebar_template.format(**s_vars)
    
    # We need to add flex flex-col md:flex-row to body
    content = re.sub(r'<body class="([^"]+)"', r'<body class="\1 flex flex-col md:flex-row"', content)
    
    content = re.sub(r'(<body[^>]*>)', r'\1\n' + sidebar, content)
    
    # At the end, add bottom nav
    bottom_nav = bottom_nav_template.format(**b_vars)
    content += "\n" + bottom_nav

    # Replace max-w-md with max-w-4xl for main content area to allow expansion
    content = content.replace("max-w-md", "max-w-4xl w-full")
    content = content.replace("w-full max-w-4xl mx-auto", "max-w-4xl mx-auto w-full") # deduplicate

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)


# Build advanced_tools.html
def build_advanced_tools():
    with open('old_index.html', 'r', encoding='utf-8') as f:
        old_html = f.read()
    
    with open('new_index.html', 'r', encoding='utf-8') as f:
        new_html = f.read()

    # Extract Tailwind config
    tailwind_match = re.search(r'<script id="tailwind-config">.*?</script>', new_html, re.DOTALL)
    tailwind_config = tailwind_match.group(0) if tailwind_match else ""

    # Extract header (top app bar)
    header_match = re.search(r'<header.*?</header>', new_html, re.DOTALL)
    header = header_match.group(0) if header_match else ""

    # Extract Modules
    # Pulse
    pulse_match = re.search(r'<!-- Module 1.*?<section class="pulse-header.*?>(.*?)</section>', old_html, re.DOTALL)
    pulse = pulse_match.group(0) if pulse_match else ""
    pulse = pulse.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Smart GR
    gr_match = re.search(r'<!-- Module 2.*?<section class="smart-gr.*?>(.*?)</section>', old_html, re.DOTALL)
    gr = gr_match.group(0) if gr_match else ""
    gr = gr.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Radar
    radar_match = re.search(r'<!-- Module 3.*?<section class="beneficiary-radar.*?>(.*?)</section>', old_html, re.DOTALL)
    radar = radar_match.group(0) if radar_match else ""
    radar = radar.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Geo Map
    map_match = re.search(r'<!-- Module 4.*?<section class="geo-map.*?>(.*?)</section>', old_html, re.DOTALL)
    map_section = map_match.group(0) if map_match else ""
    map_section = map_section.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Samvaad
    samvaad_match = re.search(r'<!-- Module 5.*?<section class="krishi-samvaad.*?>(.*?)</section>', old_html, re.DOTALL)
    samvaad = samvaad_match.group(0) if samvaad_match else ""
    samvaad = samvaad.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Friction Logger
    friction_match = re.search(r'<!-- Module 6.*?<section class="friction-logger.*?>(.*?)</section>', old_html, re.DOTALL)
    friction = friction_match.group(0) if friction_match else ""
    friction = friction.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    modal_match = re.search(r'<!-- Friction Log Modal -->(.*?)<link rel="stylesheet"', old_html, re.DOTALL)
    modal = modal_match.group(1).strip() if modal_match else ""

    content = f"""<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Advanced Tools - AgriField Gov</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    {tailwind_config}
    <style>
        body {{ min-height: max(884px, 100dvh); }}
    </style>
    <link rel="stylesheet" href="./src/style.css">
</head>
<body class="bg-background text-on-background font-body-md text-body-md antialiased pb-[100px] flex flex-col min-h-screen">
{header}
<main class="flex-1 w-full max-w-4xl mx-auto px-margin-mobile pt-stack-md pb-stack-lg flex flex-col gap-stack-lg">
    <h1 class="font-headline-lg text-headline-lg text-on-surface">Advanced Tools</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
        {pulse}
        {gr}
        {radar}
        {map_section}
        {samvaad}
        {friction}
    </div>
</main>
{modal}
<script src="./src/main.js"></script>
</body>
</html>
"""
    with open('advanced_tools.html', 'w', encoding='utf-8') as f:
        f.write(content)


# Build index.html from new_index.html (without the old_index modules)
def fix_index():
    with open('new_index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Make action grid items clickable by changing <button> to <a> or wrapping them
    # Upload Photo -> capture_photo.html
    content = re.sub(r'<button class="flex flex-col.*?<span.*?add_a_photo.*?</span>.*?</button>', 
                     r'<a href="capture_photo.html" class="flex flex-col items-center justify-center bg-surface rounded-lg border border-outline-variant p-4 gap-2 touch-target-min hover:bg-surface-variant active:bg-surface-dim transition-colors shadow-sm"><div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-1"><span class="material-symbols-outlined text-[28px]">add_a_photo</span></div><span class="font-label-bold text-label-bold text-on-surface text-center">Upload Photo</span></a>', content, flags=re.DOTALL)
    
    # New App -> applications.html
    content = re.sub(r'<button class="flex flex-col.*?<span.*?post_add.*?</span>.*?</button>', 
                     r'<a href="applications.html" class="flex flex-col items-center justify-center bg-surface rounded-lg border border-outline-variant p-4 gap-2 touch-target-min hover:bg-surface-variant active:bg-surface-dim transition-colors shadow-sm"><div class="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-1"><span class="material-symbols-outlined text-[28px]">post_add</span></div><span class="font-label-bold text-label-bold text-on-surface text-center">New App</span></a>', content, flags=re.DOTALL)
    
    # Eligible Farmers -> advanced_tools.html
    content = re.sub(r'<button class="flex flex-col.*?<span.*?how_to_reg.*?</span>.*?</button>', 
                     r'<a href="advanced_tools.html" class="flex flex-col items-center justify-center bg-surface rounded-lg border border-outline-variant p-4 gap-2 touch-target-min hover:bg-surface-variant active:bg-surface-dim transition-colors shadow-sm"><div class="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center mb-1"><span class="material-symbols-outlined text-[28px]">how_to_reg</span></div><span class="font-label-bold text-label-bold text-on-surface text-center">Eligible Farmers</span></a>', content, flags=re.DOTALL)
    
    # Today's Visits -> visit_planner.html
    content = re.sub(r'<button class="flex flex-col.*?<span.*?directions_car.*?</span>.*?</button>', 
                     r'<a href="visit_planner.html" class="flex flex-col items-center justify-center bg-surface rounded-lg border border-outline-variant p-4 gap-2 touch-target-min hover:bg-surface-variant active:bg-surface-dim transition-colors shadow-sm"><div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-1"><span class="material-symbols-outlined text-[28px]">directions_car</span></div><span class="font-label-bold text-label-bold text-on-surface text-center">Today\'s Visits</span></a>', content, flags=re.DOTALL)

    # Status Cards -> wrap in <a>
    # Pending Apps -> applications.html
    content = re.sub(r'(<div class="bg-surface[^>]*border-l-secondary.*?</div>\s*</div>)', r'<a href="applications.html" class="block hover:scale-[1.01] transition-transform">\1</a>', content, flags=re.DOTALL)
    # Verified Today -> applications.html
    content = re.sub(r'(<div class="bg-surface[^>]*border-l-primary.*?</div>\s*</div>)', r'<a href="applications.html" class="block hover:scale-[1.01] transition-transform">\1</a>', content, flags=re.DOTALL)
    # Fraud Alerts -> fraud_alerts.html
    content = re.sub(r'(<div class="bg-error-container[^>]*border-l-error.*?</div>\s*</div>)', r'<a href="fraud_alerts.html" class="block hover:scale-[1.01] transition-transform">\1</a>', content, flags=re.DOTALL)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    build_advanced_tools()
    fix_index()
    
    # Apply to all
    replace_nav('index.html', 'dashboard')
    replace_nav('applications.html', 'applications')
    replace_nav('visit_planner.html', 'planner')
    replace_nav('fraud_alerts.html', 'alerts')
    replace_nav('advanced_tools.html', 'tools')
    print("Done")
