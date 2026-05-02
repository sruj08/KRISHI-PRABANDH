import re

def main():
    with open('old_index.html', 'r', encoding='utf-8') as f:
        old_html = f.read()

    with open('new_index.html', 'r', encoding='utf-8') as f:
        new_html = f.read()

    # Extract Tailwind config
    tailwind_match = re.search(r'<script id="tailwind-config">.*?</script>', new_html, re.DOTALL)
    tailwind_config = tailwind_match.group(0) if tailwind_match else ""

    # Extract Top Navbar
    top_nav_match = re.search(r'<header.*?</header>', new_html, re.DOTALL)
    top_nav = top_nav_match.group(0) if top_nav_match else ""

    # Extract Bottom Navbar
    bottom_nav_match = re.search(r'<nav class="md:hidden.*?</nav>', new_html, re.DOTALL)
    bottom_nav = bottom_nav_match.group(0) if bottom_nav_match else ""

    # Extract New Main Content sections
    main_match = re.search(r'<main.*?>(.*?)</main>', new_html, re.DOTALL)
    main_content_new = main_match.group(1) if main_match else ""

    # Extract Old Features
    # Module 1: Pulse
    pulse_match = re.search(r'<!-- Module 1.*?<section class="pulse-header.*?>(.*?)</section>', old_html, re.DOTALL)
    pulse = pulse_match.group(0) if pulse_match else ""
    pulse = pulse.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Module 2: Smart GR
    gr_match = re.search(r'<!-- Module 2.*?<section class="smart-gr.*?>(.*?)</section>', old_html, re.DOTALL)
    gr = gr_match.group(0) if gr_match else ""
    gr = gr.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Module 3: Radar
    radar_match = re.search(r'<!-- Module 3.*?<section class="beneficiary-radar.*?>(.*?)</section>', old_html, re.DOTALL)
    radar = radar_match.group(0) if radar_match else ""
    radar = radar.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Module 4: Geo Map
    map_match = re.search(r'<!-- Module 4.*?<section class="geo-map.*?>(.*?)</section>', old_html, re.DOTALL)
    map_section = map_match.group(0) if map_match else ""
    map_section = map_section.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Module 5: Samvaad
    samvaad_match = re.search(r'<!-- Module 5.*?<section class="krishi-samvaad.*?>(.*?)</section>', old_html, re.DOTALL)
    samvaad = samvaad_match.group(0) if samvaad_match else ""
    samvaad = samvaad.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Module 6: Friction Logger
    friction_match = re.search(r'<!-- Module 6.*?<section class="friction-logger.*?>(.*?)</section>', old_html, re.DOTALL)
    friction = friction_match.group(0) if friction_match else ""
    friction = friction.replace('module-card glass-panel', 'bg-surface rounded-xl p-4 border border-outline-variant shadow-sm')

    # Modal
    modal_match = re.search(r'<!-- Friction Log Modal -->(.*?)<link rel="stylesheet"', old_html, re.DOTALL)
    modal = modal_match.group(1).strip() if modal_match else ""

    combined_html = f"""<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Krishi Sahayak - Home Dashboard</title>
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

{top_nav}

<main class="flex-1 w-full max-w-md mx-auto px-margin-mobile pt-stack-md pb-stack-lg flex flex-col gap-stack-lg">
    {main_content_new}

    <h2 class="font-label-bold text-label-bold text-outline uppercase tracking-wide mt-4">Agri-OS Advanced Tools</h2>
    {pulse}
    {gr}
    {radar}
    {map_section}
    {samvaad}
    {friction}
</main>

{bottom_nav}
{modal}

<script src="./src/main.js"></script>
</body>
</html>
"""

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(combined_html)

if __name__ == "__main__":
    main()
