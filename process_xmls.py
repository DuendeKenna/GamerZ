import os
import xml.etree.ElementTree as ET
import json
import re

# Paths
consolas_dir = r'e:\LaNaveDelMedio\GamerZ\MXP\Shots\consolas'
mxp_file = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
consoles_json_path = os.path.join(consolas_dir, 'consoles.json')

# Load consoles metadata
if os.path.exists(consoles_json_path):
    with open(consoles_json_path, 'r', encoding='utf-8') as f:
        consoles_metadata = json.load(f)
else:
    # Minimal initial metadata if file doesn't exist
    consoles_metadata = []

metadata_dict = {c['id']: c for c in consoles_metadata}
game_counts = {}

# 1. Clean XMLs, Convert to JSON, and Count Games
xml_files = [f for f in os.listdir(consolas_dir) if f.endswith('.xml')]

for xml_file in xml_files:
    console_id = xml_file.replace('.xml', '')
    full_path = os.path.join(consolas_dir, xml_file)
    json_path = os.path.join(consolas_dir, console_id + '.json')
    
    try:
        tree = ET.parse(full_path)
        root = tree.getroot()
        
        games = root.findall('game')
        game_data = []
        
        for game in games:
            # Cleanup logic: Keep only essential fields
            # Tags we WANT to keep for the frontend
            tags_to_keep = ['name', 'genre', 'releasedate', 'players', 'rating', 'desc', 'image', 'video']
            
            game_obj = {}
            for tag in tags_to_keep:
                el = game.find(tag)
                if el is not None:
                    game_obj[tag] = el.text
            
            # Additional cleanup for specific tags if needed
            # (e.g., removing redundant marquee/bezel handled by keeping only specific tags)
            
            game_data.append(game_obj)
            
            # Remove redundant or heavy tags from XML too (sync)
            tags_to_remove = ['marquee', 'fanart', 'bezel', 'boxback', 'md5', 'scrap', 'gametime', 'playcount', 'lastplayed']
            for tag in tags_to_remove:
                el = game.find(tag)
                if el is not None:
                    game.remove(el)
        
        # Write back cleaned XML
        tree.write(full_path, encoding='utf-8', xml_declaration=True)
        
        # Write minified JSON
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(game_data, f, separators=(',', ':'), ensure_ascii=False)
            
        game_counts[console_id] = len(game_data)
        
        # Update metadata
        if console_id in metadata_dict:
            metadata_dict[console_id]['gameCount'] = len(game_data)
            metadata_dict[console_id]['logo'] = f"MXP/Shots/consolas/{console_id}.svg"
            metadata_dict[console_id]['webp'] = f"MXP/Shots/consolas/{console_id}.webp"
        else:
            # Add new console to metadata if discovered
            metadata_dict[console_id] = {
                "id": console_id,
                "name": console_id.upper(),
                "logo": f"MXP/Shots/consolas/{console_id}.svg",
                "webp": f"MXP/Shots/consolas/{console_id}.webp",
                "visible": True,
                "gameCount": len(game_data)
            }
            
        print(f"Processed {xml_file}: {len(game_data)} games. JSON generated.")
        
    except Exception as e:
        print(f"Error processing {xml_file}: {e}")

# Save updated consoles.json
final_metadata = list(metadata_dict.values())
with open(consoles_json_path, 'w', encoding='utf-8') as f:
    json.dump(final_metadata, f, indent=2, ensure_ascii=False)

# 2. Update mxp.html (Counts and Visibility)
# Note: In a real app, mxp.html would ideally load this dynamically.
# For now, we update the game counts as before.

with open(mxp_file, 'r', encoding='utf-8') as f:
    content = f.read()

for console_id, console_info in metadata_dict.items():
    count = console_info.get('gameCount', 0)
    visible = console_info.get('visible', True)
    
    # Update game count badge in HTML
    pattern = rf"(onclick=\"openConsolaModal\('{console_id}'\)\"[^>]*>[\s\S]*?)<span class=\"text-white text-base font-bold drop-shadow-lg bg-black/60 px-4 py-0.5 rounded-full border border-white/20 backdrop-blur-sm\">(\d+) Juegos</span>"
    replacement = rf'\1<span class="text-white text-base font-bold drop-shadow-lg bg-black/60 px-4 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">{count} Juegos</span>'
    
    # If the pattern above doesn't match (e.g. first time), use the one from original script
    if not re.search(pattern, content):
        pattern = rf"(onclick=\"openConsolaModal\('{console_id}'\)\"[^>]*>[\s\S]*?)<span\s+class=\"absolute bottom-2 px-6 py-2 bg-violet-600/90 text-white font-bold text-xl rounded-full shadow-2xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 pointer-events-none border border-violet-400 backdrop-blur-sm z-20\">Ver\s+Catálogo</span>"
        replacement = r'\1' + f"""<div class="absolute bottom-2 flex flex-col items-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 z-20 pointer-events-none">
                                        <span class="px-8 py-1 bg-violet-600/90 text-white font-bold text-2xl rounded-full shadow-2xl border border-violet-400 backdrop-blur-sm mb-1">Ver</span>
                                        <span class="text-white text-base font-bold drop-shadow-lg bg-black/60 px-4 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">{count} Juegos</span>
                                    </div>"""
                                    
    content = re.sub(pattern, replacement, content)
    
    # Handling Visibility (Advanced): 
    # To hide a console completely in the HTML based on the JS/JSON field, 
    # we would need to mark the <div> or <a> wrapping the console item.
    # Looking at mxp.html, console items are typically in the marquee.
    
    # Suggestion: mxp.html should load consoles from consoles.json to be truly dynamic.
    # For now, let's at least update counts.

with open(mxp_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML updated with game counts.")
