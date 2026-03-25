import os
import json
import re
from bs4 import BeautifulSoup

def extract_pc_games():
    base_dir = r"e:\LaNaveDelMedio\GamerZ\MXP\Col"
    pc_html_path = os.path.join(base_dir, "pc.html")
    output_dir = r"e:\LaNaveDelMedio\GamerZ\MXP\Admin\data"
    output_path = os.path.join(output_dir, "pc.json")

    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(pc_html_path):
        print(f"Error: {pc_html_path} no encontrado.")
        return

    with open(pc_html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    games = []
    cards = soup.find_all('figure', class_='card')
    
    for card in cards:
        a_tag = card.find('a')
        if not a_tag:
            continue
        
        href = a_tag.get('href', '')
        if not href.endswith('.html'):
            continue
            
        uuid = href.replace('.html', '')
        
        img_tag = card.find('img')
        img_src = img_tag.get('data-src') if img_tag else ''
        if img_src and not img_src.startswith('../'):
            # El path es relativo a MXP/Col/
            img_src = f"../Col/{img_src}"
            
        figcaption = card.find('figcaption')
        title = figcaption.text.strip() if figcaption else 'Desconocido'
        
        game_data = {
            'id': uuid,
            'name': title,
            'image': img_src,
            'platform': 'PC',
            'year': '',
            'description_html': '',
            'genre': '',
            'developer': ''
        }
        
        detail_path = os.path.join(base_dir, href)
        if os.path.exists(detail_path):
            with open(detail_path, 'r', encoding='utf-8') as df:
                detail_soup = BeautifulSoup(df, 'html.parser')
                
                # Extraer año de lanzamiento
                tds = detail_soup.find_all('td')
                for i, td in enumerate(tds):
                    if 'Fecha de lanzamiento' in td.text:
                        next_td = tds[i+1]
                        a_date = next_td.find('a')
                        if a_date:
                            date_str = a_date.text.strip()
                            # Extraer el año, usualmente el último bloque si es DD/MM/YYYY
                            parts = date_str.split('/')
                            if len(parts) == 3:
                                game_data['year'] = parts[2][:4]
                            elif len(parts) > 0:
                                game_data['year'] = parts[-1][:4]
                        break
                
                for i, td in enumerate(tds):
                    if td.text.strip() == 'Género':
                        next_td = tds[i+1]
                        genres = [a.text for a in next_td.find_all('a')]
                        game_data['genre'] = ', '.join(genres)
                    elif td.text.strip() == 'Desarrollador':
                        next_td = tds[i+1]
                        devs = [a.text for a in next_td.find_all('a')]
                        game_data['developer'] = ', '.join(devs)

                # Extraer descripción HTML
                desc_div = detail_soup.find('div', class_='description')
                if desc_div:
                    # Limpiamos los tags H3 de "Notas" para que quede más limpio
                    game_data['description_html'] = str(desc_div)
                    
        games.append(game_data)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(games, f, ensure_ascii=False, indent=4)
        
    print(f"Éxito: Se han extraído {len(games)} juegos de PC y guardado en {output_path}")

if __name__ == '__main__':
    extract_pc_games()
