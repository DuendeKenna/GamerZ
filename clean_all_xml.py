import os
import glob
import xml.etree.ElementTree as ET

directory = r'e:\LaNaveDelMedio\GamerZ\MXP\Shots\consolas'
xml_files = glob.glob(os.path.join(directory, '*.xml'))

tags_to_keep = {'name', 'desc', 'genre', 'players', 'releasedate', 'rating'}

for f_path in xml_files:
    if os.path.basename(f_path) == "arcade.xml":
        continue
    try:
        tree = ET.parse(f_path)
        root = tree.getroot()
        
        seen_names = set()
        games_to_remove = []
        
        for game in root.findall('game'):
            # 1. Clean extra properties
            elements_to_remove = []
            for child in game:
                if child.tag not in tags_to_keep:
                    elements_to_remove.append(child)
            
            for child in elements_to_remove:
                game.remove(child)
                
            # 2. Check for missing properties (only has <name>)
            # An element might have <name> and <path> originally, but <path> is gone now.
            name_node = game.find('name')
            name = name_node.text if name_node is not None else None
            
            # If the game has 1 or fewer properties (like just <name>), mark for deletion
            if len(list(game)) <= 1:
                games_to_remove.append(game)
                continue
                
            # 3. Check for duplicates
            if name:
                name_lower = name.lower().strip()
                if name_lower in seen_names:
                    games_to_remove.append(game)
                else:
                    seen_names.add(name_lower)
            else:
                # No name? Probably want to remove it too
                games_to_remove.append(game)

        # Remove the marked games from the root
        for game in games_to_remove:
            root.remove(game)

        # Write output
        xml_str = ET.tostring(root, encoding='utf-8', xml_declaration=True).decode('utf-8')
        with open(f_path, 'w', encoding='utf-8') as f:
            f.write(xml_str)
            
        print(f"Cleaned {os.path.basename(f_path)} | Removed {len(games_to_remove)} invalid/duplicate games.")
    except Exception as e:
        print(f"Error processing {f_path}: {e}")
