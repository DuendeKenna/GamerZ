import xml.etree.ElementTree as ET
import sys
import os

def process_xml(input_path):
    if not os.path.exists(input_path):
        print(f"Error: File '{input_path}' not found.")
        sys.exit(1)

    try:
        tree = ET.parse(input_path)
        root = tree.getroot()
    except Exception as e:
        print(f"Error parsing XML: {e}")
        sys.exit(1)

    # We want to keep: name, desc, genre, players, releasedate, rating
    tags_to_keep = {'name', 'desc', 'genre', 'players', 'releasedate', 'rating'}

    for game in root.findall('game'):
        # Find all child elements
        elements_to_remove = []
        for child in game:
            if child.tag not in tags_to_keep:
                elements_to_remove.append(child)
        
        # Remove unwanted elements
        for child in elements_to_remove:
            game.remove(child)

    # Save the cleaned XML back to the file (or a new file)
    output_path = input_path # Overwrite by default, can be changed if needed
    
    # We use a custom declaration to match the original <?xml version="1.0"?>
    xml_str = ET.tostring(root, encoding='utf-8', xml_declaration=True).decode('utf-8')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(xml_str)
        
    print(f"Successfully simplified XML. Saved to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clean_xml.py <path_to_xml_file>")
        sys.exit(1)
        
    input_file = sys.argv[1]
    process_xml(input_file)
