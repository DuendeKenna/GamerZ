import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Reduce marquee padding to lower the height
content = content.replace('py-10 overflow-x-auto', 'py-4 overflow-x-auto')

# 2. Refactor console items
# New structure: SVG (absolute top), Image (normal), Label (absolute center-ish)
consoles = ['arcade', 'dreamcast', 'gba', 'gc', 'megadrive', 'n64', 'neogeo', 'nes', 'ps2', 'psp', 'psx', 'snes', 'wii']

for console in consoles:
    # Match the entire div content for the console, handles multiline span precisely
    pattern = rf'(<div class="relative flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"\s+onclick="openConsolaModal\(\'{console}\'\)" style="-webkit-user-drag: none;">)\s+<img src="MXP/Shots/consolas/{console}\.svg"[\s\S]*?>\s+(<img src="MXP/Shots/consolas/{console}\.webp"[\s\S]*?>)\s+<span[\s\S]*?>[\s\S]*?Ver[\s\S]*?Catálogo[\s\S]*?</span>'
    
    # New parts
    # SVG: positioned better
    new_svg = f'<img src="MXP/Shots/consolas/{console}.svg" alt="{console} logo" class="absolute top-4 h-20 w-auto object-contain transition-all duration-300 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 pointer-events-none drop-shadow-lg z-10">'
    
    # Label: violet, rounded, absolute center-ish
    new_label = '<span class="absolute bottom-1/4 px-6 py-2 bg-violet-600/90 text-white font-bold text-xl rounded-full shadow-2xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 pointer-events-none border border-violet-400 backdrop-blur-sm z-20">Ver Catálogo</span>'
    
    # Replacement logic
    # $1: div open, $2: webp img
    replacement = rf'\1\n                                {new_svg}\n                                \2\n                                {new_label}'

    content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Marquee height reduced and items refined with violet labels.")
