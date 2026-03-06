import sys

file_path = r'e:\LaNaveDelMedio\GamerZ\mxp.html'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # Very simple tag counter for this specific section
    line_num = i + 1
    if 735 <= line_num <= 1100:
        div_opens = line.count('<div ') + line.count('<div\n') + line.count('<div>')
        div_closes = line.count('</div>')
        for _ in range(div_opens):
            stack.append(line_num)
        for _ in range(div_closes):
            if stack:
                stack.pop()
            else:
                print(f"Error: Stray </div> at line {line_num}")

print(f"Stack depth at line 1100: {len(stack)}")
if stack:
    print(f"Open divs at lines: {stack}")
