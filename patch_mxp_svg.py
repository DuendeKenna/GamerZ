import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For each console 'name', we need to append the SVG inside the parent div
# We can find all the images with: <img src="MXP/Shots/consolas/(.+?).webp"
# And then inject the SVG right after it.
# Also we need to ensure the parent div has 'relative' class.

consoles = ['arcade', 'dreamcast', 'gba', 'gc', 'megadrive', 'n64', 'neogeo', 'nes', 'ps2', 'psp', 'psx', 'snes', 'wii']

for console in consoles:
    # 1. Add 'relative' to the parent div
    # The parent div ends with `onclick="openConsolaModal('arcade')" style="-webkit-user-drag: none;">`
    # Let's target the exact class string of the parent div.
    old_class = 'class="flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"'
    new_class = 'class="relative flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"'
    
    # Actually just replace globally since it's the only place this class appears, but wait, it might already be relative if I do it blindly.
    if 'relative flex flex-col items-center justify-center cursor-pointer group hover' not in content:
        content = content.replace(
            'class="flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"',
            'class="relative flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"'
        )
    
    # 2. Inject the SVG image
    webp_img_tag = f'<img src="MXP/Shots/consolas/{console}.webp" alt="{console}"\n                                    class="w-[230px] h-[230px] object-contain drop-shadow-2xl pointer-events-none"\n                                    style="-webkit-user-drag: none;">'
    
    svg_img_tag = f'<img src="MXP/Shots/consolas/{console}.svg" alt="{console} logo" class="absolute -bottom-10 h-16 w-auto object-contain transition-all duration-300 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 pointer-events-none drop-shadow-lg">'
    
    # Check if we already injected it
    if f'{console}.svg" alt="{console} logo"' not in content:
        content = content.replace(webp_img_tag, webp_img_tag + '\n                                ' + svg_img_tag)
        

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected SVG hovers into mxp.html successfully.")
