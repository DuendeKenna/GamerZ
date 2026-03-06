import re

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the empty if/else logic in animateMarquee
pattern = r'if \(hoverSpeed < -0\.5\) \{[\s\S]*?\} else if \(hoverSpeed > 0\.5\) \{[\s\S]*?\} else \{[\s\S]*?\}'
content = re.sub(pattern, '', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("JS Cleanup complete.")
