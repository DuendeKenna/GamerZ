import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Resize SVG Logos in console marquee by 20% (h-20 -> h-16)
content = content.replace('h-20 w-auto object-contain', 'h-16 w-auto object-contain')

# 2. Fix the Nesting of Joysticks Section
# We'll search for the end of the marquee and the start of the joysticks section
# to ensure everything is closed correctly.

# First, let's normalize the closing tags after marqueeGroup2
# Look for the last item in Group 2 (wii)
item_pattern = r'(<div class="relative flex flex-col items-center justify-center cursor-pointer group hover:scale-110 transition-transform duration-300"\s+onclick="openConsolaModal\(\'wii\'\)"[\s\S]*?</span>\s+</div>)'
# Followed by closings
closing_and_joysticks = r'(\s+</div>\s+</div>\s+</div>\s+<!-- Joysticks Sub-section -->)'

# We need to make sure we have exactly 3 closings for Groups/Container/Consolas
# Plus maybe one for container if it was misplaced.

# Let's do a more robust approach: reconstruct the ending of the marquee section.
pattern_fix = r'(<div id="marqueeGroup2"[\s\S]*?</span>\s+</div>)(\s+</div>\s+</div>\s+</div>\s+</div>)?\s+(<!-- Joysticks Sub-section -->)'

def restructure(match):
    group2_content = match.group(1)
    # Group 2 should close, then Container should close, then groupConsolas should close.
    # Total 3 </div> tags.
    return group2_content + "\n                        </div>\n                    </div>\n                </div>\n\n                " + match.group(3)

content = re.sub(pattern_fix, restructure, content)

# 3. Clean up potential extra closing divs that might have shifted down
content = content.replace('</div>\n            </div>\n        </section>', '</div>\n        </section>') # Just in case

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SVG Logos resized (h-16) and Marquee/Joysticks structure corrected.")
