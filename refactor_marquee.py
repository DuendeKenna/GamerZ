import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Hover Arrows HTML
content = re.sub(r'<!-- Hover Arrows -->\s+<div id="marqueeArrowLeft"[\s\S]*?</div>\s+<div id="marqueeArrowRight"[\s\S]*?</div>', '', content, count=1)

# 2. Update Console items structure
# Using a more robust pattern covering both webp and svg children
pattern = r'(<div class="relative flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"\s+onclick="openConsolaModal\(\'(.+?)\'\)" style="-webkit-user-drag: none;">)\s+(<img src="MXP/Shots/consolas/\2.webp"[\s\S]*?>)\s+(<img src="MXP/Shots/consolas/\2.svg"[\s\S]*?>)'

def replacement(match):
    div_open = match.group(1)
    console_id = match.group(2)
    webp_img = match.group(3)
    
    # New SVG Logo (top)
    svg_new = f'<img src="MXP/Shots/consolas/{console_id}.svg" alt="{console_id} logo" class="h-16 w-auto object-contain transition-all duration-300 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 pointer-events-none drop-shadow-lg mb-4">'
    
    # New Text (bottom)
    text_new = f'<span class="text-white font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 mt-4">Ver Catálogo</span>'
    
    # Reassemble, putting webp in between SVG and text
    return f'{div_open}\n                                {svg_new}\n                                {webp_img}\n                                {text_new}'

content = re.sub(pattern, replacement, content)

# 3. Clean up JS references
content = re.sub(r'const marqueeArrowLeft = document.getElementById\(\'marqueeArrowLeft\'\);', '', content)
content = re.sub(r'const marqueeArrowRight = document.getElementById\(\'marqueeArrowRight\'\);', '', content)
content = content.replace("marqueeArrowLeft.style.opacity = '0.7';", "")
content = content.replace("marqueeArrowRight.style.opacity = '0.7';", "")
content = content.replace("marqueeArrowLeft.style.opacity = '0';", "")
content = content.replace("marqueeArrowRight.style.opacity = '0';", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML Structure updated and Arrows removed.")
