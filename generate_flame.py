import sys

# Flame colors
O = "#3E2723"  # Outline (dark brown/black)
B1 = "#5A3A22" # Dark brown log
B2 = "#815B3A" # Light brown log
B3 = "#B38C61" # Log end (inner)
B4 = "#C8A57D" # Log end (outer)
R = "#D84315"  # Red/Dark Orange flame
O1 = "#FF9800" # Orange flame
Y = "#FFEB3B"  # Yellow flame
W = "#FFF9C4"  # White/Cream core
T = "transparent"

palette = {
    ' ': T,
    'O': O,
    '1': B1,
    '2': B2,
    '3': B3,
    '4': B4,
    'R': R,
    'G': O1,
    'Y': Y,
    'W': W
}

# 24x24 pixel art
art = [
    "                        ",
    "       OOOO             ",
    "      O R  O            ",
    "      O  RG O           ",
    "       O R  O   O       ",
    "       O R G O O R O    ",
    "      O R  GY O R G O   ",
    "    OO R GY  G O R G O  ",
    "   O R G Y W   G O R  O ",
    "  O R G  YW   GY  G R O ",
    "  O R GY Y W  Y   G R O ",
    "  O R G   W  Y G  G R O ",
    "   O R G Y  W Y  G R G O",
    "   O R G   Y  G  R  G O ",
    "  O R G YY  Y   G R  O  ",
    "  OOOOOOOOOOOOOOOOOOOO  ",
    " O433O1111111111OO2OO   ",
    " O3O3O1222222221O2222O  ",
    "O433O1O222O22O21O222O2O ",
    " O3O3O1111111111O22O22O ",
    " O433OOOOOOOOOOOO222O2O ",
    "  OOO            O222OO ",
    "                  OOOO  ",
    "                        ",
]

# Let's refine the ASCII drawing to better match the attachment
art = [
    "           R            ",
    "          RR            ",
    "         RRR            ",
    "         RGR            ",
    "       T RRGR       R   ",
    "   R    RRGYR      RR   ",
    "  RR   RRGYYGR    RGR   ",
    " RRGR  RRGYYWGR   RGGR  ",
    " RGGGR RRGYWYWGR  RGGR  ",
    " RGGGYR RGYWYYWGRRGGGR  ",
    "  RGGYYRRGYWWYWGRGGYR   ",
    "  RRGGYYRGYWYWWGRGYYR   ",
    "   RRGGYRGYYWWYWGGYYR   ",
    "   RRGGGYYGYYWYWGYYR    ",
    "    RRRGGGGYYYYGYYR     ",
    "      RRRGGGGGYYGR      ",
    "  OOOOOOOOOOOOOOOOOOOO  ",
    " O433O1111111111OO334O  ",
    " O3O3O1222222221O3O34O  ",
    "O433O1O222O22O21O4334O  ",
    " O3O3O1111111111O4O34O  ",
    " O433OOOOOOOOOOOO4334O  ",
    "  OOO            OOOO   ",
    "                        ",
]

# I will recreate based exactly on the user image logic:
# Two logs crossed.
# Let's map it meticulously: Width 28, Height 28
]

exact_art = [
    "                            ",
    "             O              ",
    "            O O             ",
    "            O RO            ",
    "            OR O            ",
    "            ORRO            ",
    "          O ORGO            ",
    "        OO O OGO O          ",
    "       O  O O O O RO        ",
    "      O  R O ORRO RO        ",
    "      O R O  RGYO R O       ",
    "     O RGO  RGGYO  R O      ",
    "    O R G O RGYW O RGO      ",
    "    O R  GO ORYWO GRGO      ",
    "    O  RGGO ORWW ORGGO      ",
    "     O RGY O GYW ORGYO      ",
    "      O GY  RGWW RGGO       ",
    "       ORG YY GW YRGO       ",
    " OO    O G  G  Y  YGO    OO ",
    "O  O  OORRR    Y R OOO  O  O",
    "O  OOOO 1111111111O  OOOO  O",
    "O  O  O O122222221OO O  O  O",
    "O  O  O O121221221O  O  O  O",
    " O OO  O 111111111 OO O O O ",
    "  O   OO OOOOOOOOOO    O   O",
    "      O O          O O      ",
    "      OO            OO      ",
    "                            ",
]

template = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" shape-rendering="crispEdges">
  <g>
"""

with open("web/public/favicon-pixel.svg", "w") as f:
    f.write(template)
    for y, row in enumerate(exact_art):
        for x, char in enumerate(row):
            if char != ' ':
                color = palette.get(char, "transparent")
                if color != "transparent":
                    f.write(f'    <rect x="{x}" y="{y}" width="1" height="1" fill="{color}"/>\n')
    f.write("  </g>\n</svg>\n")

# And cursor:
with open("web/public/cursor-flame.svg", "w") as f:
    f.write(template.replace('width="28" height="28"', 'width="36" height="36"'))
    for y, row in enumerate(exact_art):
        for x, char in enumerate(row):
            if char != ' ':
                color = palette.get(char, "transparent")
                if color != "transparent":
                    f.write(f'    <rect x="{x}" y="{y}" width="1" height="1" fill="{color}"/>\n')
    f.write("  </g>\n</svg>\n")

print("Created SVGs")
