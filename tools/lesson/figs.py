import math

out = []
def add(s): out.append(s)

def pt(x, y, a, L, f=1):
    r = math.radians(a)
    return x + f * L * math.sin(r), y + L * math.cos(r)

def limb(p0, a1, L1, a2, L2, f, c1, c2, w1, w2):
    x0, y0 = p0
    x1, y1 = pt(x0, y0, a1, L1, f)
    x2, y2 = pt(x1, y1, a2, L2, f)
    add(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke="{c1}" stroke-width="{w1:.1f}" stroke-linecap="round"/>')
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c2}" stroke-width="{w2:.1f}" stroke-linecap="round"/>')
    return (x1, y1), (x2, y2)

def person(hx, hy, s=0.6, f=1, skin="#f1c27d", hair="#2b1d16", hstyle="short",
           shirt="#1e88e5", pants="#37474f", skirt=False, shoes="#263238",
           legs=((0, 0), (0, 0)), arms=((10, 10), (-10, -10)), lean=0, mouth="smile",
           hold=None, hold_back=None, hat=None):
    T, TH, SH, UA, FA = 55*s, 42*s, 43*s, 30*s, 27*s
    sx, sy = pt(hx, hy, 180 + lean, T, f)
    cx, cy = pt(hx, hy, 180 + lean, T + 21*s, f)
    r = 14.5*s
    if hstyle == "long":
        add(f'<rect x="{cx-r*1.08:.1f}" y="{cy-r*0.3:.1f}" width="{2.16*r:.1f}" height="{r*2.3:.1f}" rx="{r*0.7:.1f}" fill="{hair}"/>')
    (bl_u, bl_l), (fl_u, fl_l) = legs
    (ba_u, ba_l), (fa_u, fa_l) = arms
    legc = skin if skirt else pants
    k, foot = limb((hx - 3*s*f, hy), bl_u, TH, bl_l, SH, f, legc, legc, 15*s, 13*s)
    add(f'<ellipse cx="{foot[0]+4*s*f:.1f}" cy="{foot[1]+2*s:.1f}" rx="{8*s:.1f}" ry="{4.5*s:.1f}" fill="{shoes}"/>')
    e, hand_b = limb((sx - 6*s*f, sy + 3*s), ba_u, UA, ba_l, FA, f, shirt, skin, 11*s, 9*s)
    add(f'<circle cx="{hand_b[0]:.1f}" cy="{hand_b[1]:.1f}" r="{5*s:.1f}" fill="{skin}"/>')
    if hold_back:
        hold_back(hand_b, s, f)
    nx, ny = pt(hx, hy, 180 + lean, T + 6*s, f)
    pts = [(sx - 18*s, sy), (sx + 18*s, sy), (hx + 14*s, hy), (hx - 14*s, hy)]
    add('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in pts) +
        f'" fill="{shirt}" stroke="{shirt}" stroke-width="{7*s:.1f}" stroke-linejoin="round"/>')
    if skirt:
        add(f'<polygon points="{hx-12*s:.1f},{hy-4*s:.1f} {hx+12*s:.1f},{hy-4*s:.1f} {hx+20*s:.1f},{hy+26*s:.1f} {hx-20*s:.1f},{hy+26*s:.1f}" fill="{skirt}"/>')
    k, foot = limb((hx + 3*s*f, hy), fl_u, TH, fl_l, SH, f, legc, legc, 15*s, 13*s)
    add(f'<ellipse cx="{foot[0]+4*s*f:.1f}" cy="{foot[1]+2*s:.1f}" rx="{8*s:.1f}" ry="{4.5*s:.1f}" fill="{shoes}"/>')
    add(f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{nx:.1f}" y2="{ny:.1f}" stroke="{skin}" stroke-width="{10*s:.1f}"/>')
    if hstyle == "pony":
        add(f'<ellipse cx="{cx-r*1.0*f:.1f}" cy="{cy+r*0.2:.1f}" rx="{r*0.45:.1f}" ry="{r*0.9:.1f}" fill="{hair}"/>')
    add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{skin}"/>')
    add(f'<path d="M{cx-r*1.05:.1f} {cy+r*0.05:.1f} A{r*1.05:.1f} {r*1.05:.1f} 0 0 1 {cx+r*1.05:.1f} {cy+r*0.05:.1f} '
        f'Q{cx+r*0.6*f:.1f} {cy-r*0.45:.1f} {cx-r*0.1*f:.1f} {cy-r*0.35:.1f} Z" fill="{hair}"/>')
    if hat:
        add(f'<ellipse cx="{cx:.1f}" cy="{cy-r*0.55:.1f}" rx="{r*1.7:.1f}" ry="{r*0.35:.1f}" fill="{hat}"/>'
            f'<path d="M{cx-r*0.9:.1f} {cy-r*0.55:.1f} Q{cx:.1f} {cy-r*1.9:.1f} {cx+r*0.9:.1f} {cy-r*0.55:.1f} Z" fill="{hat}"/>')
    ex = cx + r*0.35*f
    add(f'<circle cx="{ex-r*0.2:.1f}" cy="{cy+r*0.05:.1f}" r="{r*0.11:.1f}" fill="#2b2b2b"/>')
    add(f'<circle cx="{ex+r*0.32:.1f}" cy="{cy+r*0.05:.1f}" r="{r*0.11:.1f}" fill="#2b2b2b"/>')
    if mouth == "smile":
        add(f'<path d="M{ex-r*0.2:.1f} {cy+r*0.45:.1f} Q{ex+r*0.08:.1f} {cy+r*0.68:.1f} {ex+r*0.35:.1f} {cy+r*0.45:.1f}" stroke="#7a3b2e" stroke-width="{1.4*s:.1f}" fill="none" stroke-linecap="round"/>')
    elif mouth == "open":
        add(f'<ellipse cx="{ex+r*0.08:.1f}" cy="{cy+r*0.5:.1f}" rx="{r*0.16:.1f}" ry="{r*0.13:.1f}" fill="#7a3b2e"/>')
    e, hand = limb((sx + 6*s*f, sy + 3*s), fa_u, UA, fa_l, FA, f, shirt, skin, 11*s, 9*s)
    add(f'<circle cx="{hand[0]:.1f}" cy="{hand[1]:.1f}" r="{5*s:.1f}" fill="{skin}"/>')
    if hold:
        hold(hand, s, f)
    return hand, hand_b
