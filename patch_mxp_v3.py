import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update image sizes from 230 to 300
content = content.replace('w-[230px] h-[230px]', 'w-[300px] h-[300px]')

# 2. Update SVG position: move closer to image
# Old: -bottom-10
# New: bottom-0 (or similar)
content = content.replace('-bottom-10', 'bottom-0')

# 3. Add Arrows to the container
# We'll inject them into the #groupConsolas div
arrows_html = """
                <div id="groupConsolas"
                    class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black/20 border-y border-white/10 py-10 overflow-x-auto scrollbar-hide select-none mt-8 mb-12 cursor-grab"
                    style="touch-action: pan-x;">
                    
                    <!-- Hover Arrows -->
                    <div id="marqueeArrowLeft" class="absolute left-10 top-1/2 -translate-y-1/2 z-50 opacity-0 transition-opacity duration-300 pointer-events-none text-white text-6xl drop-shadow-lg">
                        <img src="XP_Icons/left_arrow_xp.png" class="w-16 h-16 opacity-70" style="filter: brightness(0) invert(1);" onerror="this.style.display='none'; this.parentElement.innerHTML='‹';">
                    </div>
                    <div id="marqueeArrowRight" class="absolute right-10 top-1/2 -translate-y-1/2 z-50 opacity-0 transition-opacity duration-300 pointer-events-none text-white text-6xl drop-shadow-lg">
                        <img src="XP_Icons/right_arrow_xp.png" class="w-16 h-16 opacity-70" style="filter: brightness(0) invert(1);" onerror="this.style.display='none'; this.parentElement.innerHTML='›';">
                    </div>
"""
# Note: I'll use a safer injection point.
content = re.sub(r'<div id="groupConsolas"[\s\S]*?>', arrows_html, content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML Sizing and Arrow injection complete.")
