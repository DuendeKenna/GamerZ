import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modify image sizes from w-48 h-48 to w-[230px] h-[230px] (+20% of 192px)
# But wait, looking at the previous file content, it was 'w-48 h-48 object-contain drop-shadow-2xl'
content = content.replace('w-48 h-48 object-contain', 'w-[230px] h-[230px] object-contain')

# 2. Modify mouseup handler to not resume auto-scrolling
old_js = """        groupConsolas.addEventListener('mouseup', () => {
            isDown = false;
            isAutoScrolling = true;
            groupConsolas.style.cursor = 'grab';
        });"""

new_js = """        groupConsolas.addEventListener('mouseup', () => {
            isDown = false;
            // The animation remains paused because the mouse is still hovering (focus).
            // It will resume when 'mouseleave' fires.
            groupConsolas.style.cursor = 'grab';
        });"""

content = content.replace(old_js, new_js)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications applied successfully.")
