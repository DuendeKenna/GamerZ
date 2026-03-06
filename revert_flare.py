import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Top Flare
content = re.sub(r'<!-- Top Curved Flare Overlay -->\s+<div class="absolute -top-16[\s\S]*?</div>', '', content)

# 2. Remove Bottom Flare
content = re.sub(r'<!-- Bottom Curved Flare Overlay -->\s+<div class="absolute -bottom-16[\s\S]*?</div>', '', content)

# 3. Handle the Wrapper
# We need to find the wrapper's opening and closing tags.
wrapper_opening = r'<!-- Marquee Stylized Wrapper -->\s+<div class="relative w-screen left-1/2 right-1/2 -ml-\[50vw\] -mr-\[50vw\] mt-16 mb-20 group/marquee">'

# The wrapper wraps groupConsolas.
# Let's search for the whole block from wrapper start to its closing </div> which should be after groupConsolas.

# We'll use a regex that matches the wrapper AND its content, but we want to KEEP groupConsolas.
# Structure: <wrapper> <flares...> <groupConsolas>...</groupConsolas> </wrapper>
# Since we already removed flares, it's <wrapper> <groupConsolas>...</groupConsolas> </wrapper>

pattern_full = r'<!-- Marquee Stylized Wrapper -->\s+<div class="relative w-screen left-1/2 right-1/2 -ml-\[50vw\] -mr-\[50vw\] mt-16 mb-20 group/marquee">\s+(<div id="groupConsolas"[\s\S]*?</div>)\s+</div>'

def fix_group(match):
    inner = match.group(1)
    # Restore classes to groupConsolas
    inner = inner.replace(
        'class="relative w-full bg-black/50 py-20 overflow-x-auto scrollbar-hide select-none cursor-grab"',
        'class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black/20 border-y border-white/10 py-4 overflow-x-auto scrollbar-hide select-none mt-8 mb-12 cursor-grab"'
    )
    return inner

# If pattern match fails (maybe because of flares still there), we do it more surgically.
new_content = re.sub(pattern_full, fix_group, content)

if new_content == content:
    # Surgical fallback
    content = re.sub(wrapper_opening, '', content)
    # Revert groupConsolas classes
    content = content.replace(
        'class="relative w-full bg-black/50 py-20 overflow-x-auto scrollbar-hide select-none cursor-grab"',
        'class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-black/20 border-y border-white/10 py-4 overflow-x-auto scrollbar-hide select-none mt-8 mb-12 cursor-grab"'
    )
    # We'll have a stray </div>. It should be after the marqueeGroup2 closing.
    # Let's just look for the specific sequence of closing divs.
    content = content.replace('</div>\n                </div>\n                </div>\n                </div>\n                <!-- Joysticks Sub-section -->', '</div>\n                </div>\n                </div>\n                <!-- Joysticks Sub-section -->')

else:
    content = new_content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted Flare effect and restored layout structure.")
