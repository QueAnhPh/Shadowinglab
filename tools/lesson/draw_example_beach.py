from figs import add, out, person

def phone(h, s, f):
    x, y = h
    add(f'<rect x="{x-5*s:.1f}" y="{y-16*s:.1f}" width="{10*s:.1f}" height="{17*s:.1f}" rx="{2*s:.1f}" fill="#263238"/>'
        f'<rect x="{x-3.5*s:.1f}" y="{y-14*s:.1f}" width="{7*s:.1f}" height="{12*s:.1f}" fill="#80deea"/>')

def suitcase(h, s, f):
    x, y = h
    add(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x-14*s*f:.1f}" y2="{y+34*s:.1f}" stroke="#555" stroke-width="{3*s:.1f}"/>')
    add(f'<rect x="{x-14*s*f-18*s:.1f}" y="{y+34*s:.1f}" width="{36*s:.1f}" height="{52*s:.1f}" rx="{5*s:.1f}" fill="#e53935" stroke="#b71c1c" stroke-width="{2*s:.1f}"/>')
    add(f'<circle cx="{x-14*s*f-10*s:.1f}" cy="{y+90*s:.1f}" r="{4*s:.1f}" fill="#333"/><circle cx="{x-14*s*f+10*s:.1f}" cy="{y+90*s:.1f}" r="{4*s:.1f}" fill="#333"/>')

def bag(h, s, f):
    x, y = h
    add(f'<rect x="{x-10*s:.1f}" y="{y:.1f}" width="{20*s:.1f}" height="{22*s:.1f}" rx="{2*s:.1f}" fill="#ffca28" stroke="#f57f17" stroke-width="{1.5*s:.1f}"/>')

def skewer(h, s, f):
    x, y = h
    add(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x+10*s*f:.1f}" y2="{y-26*s:.1f}" stroke="#a1887f" stroke-width="{2*s:.1f}"/>')
    for k in range(3):
        add(f'<circle cx="{x+(4+3*k)*s*f:.1f}" cy="{y-(10+7*k)*s:.1f}" r="{4*s:.1f}" fill="#8d4004"/>')

def book(h, s, f):
    x, y = h
    add(f'<rect x="{x-12*s:.1f}" y="{y-16*s:.1f}" width="{22*s:.1f}" height="{16*s:.1f}" fill="#fff" stroke="#1565c0" stroke-width="{3*s:.1f}"/>')

add('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">')
add('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8f2"/><stop offset="1" stop-color="#d9f2fc"/></linearGradient>'
    '<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e88e5"/><stop offset="1" stop-color="#4dd0e1"/></linearGradient></defs>')
add('<rect width="1200" height="800" fill="url(#sky)"/>')
add('<circle cx="1050" cy="90" r="50" fill="#ffd54f"/><circle cx="1050" cy="90" r="72" fill="#ffd54f" opacity="0.25"/>')
add('<g fill="#fff"><ellipse cx="560" cy="80" rx="70" ry="26"/><ellipse cx="610" cy="66" rx="48" ry="28"/><ellipse cx="820" cy="120" rx="50" ry="18"/></g>')
add('<path d="M330 260 L420 190 L500 240 L580 175 L700 260 Z" fill="#81a99a" opacity="0.7"/>')  # island hills
add('<rect x="0" y="260" width="1200" height="180" fill="url(#sea)"/>')
for y in (300, 340, 385):
    add(f'<path d="M300 {y} q20 -8 40 0 M640 {y+10} q20 -8 40 0 M1000 {y-5} q20 -8 40 0" stroke="#e3f2fd" stroke-width="2" fill="none"/>')
add('<path d="M0 430 Q300 410 600 432 T1200 425 V800 H0 Z" fill="#f3dfa9"/>')
add('<path d="M0 430 Q300 410 600 432 T1200 425" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.8"/>')

# boat (boat trip) on the sea
add('<path d="M500 315 h120 l-18 26 h-86 z" fill="#ffffff" stroke="#546e7a" stroke-width="2"/>'
    '<rect x="530" y="292" width="50" height="23" fill="#fff" stroke="#546e7a" stroke-width="2"/>'
    '<line x1="590" y1="292" x2="590" y2="262" stroke="#546e7a" stroke-width="2"/><polygon points="590,262 612,270 590,278" fill="#e53935"/>')
for i, c in enumerate(["#ef5350", "#ffca28", "#66bb6a"]):
    add(f'<circle cx="{540+i*16}" cy="302" r="5" fill="{c}"/>')

# hotel
add('<rect x="20" y="130" width="230" height="310" fill="#fff3e0" stroke="#d7a86e" stroke-width="3"/>')
add('<rect x="20" y="118" width="230" height="16" fill="#d7a86e"/>')
for r in range(4):
    for c in range(4):
        add(f'<rect x="{38+c*52}" y="{158+r*52}" width="30" height="30" fill="#90caf9" stroke="#d7a86e" stroke-width="2"/>')
add('<rect x="100" y="370" width="70" height="70" fill="#8d6e63"/><rect x="72" y="342" width="126" height="24" rx="4" fill="#1f3a68"/>'
    '<text x="135" y="360" font-family="DejaVu Sans" font-weight="bold" font-size="16" fill="#fff" text-anchor="middle">HOTEL</text>')

def palm(x, y, h):
    add(f'<path d="M{x} {y} q-10 {-h/2} 6 {-h}" stroke="#8d6e63" stroke-width="12" fill="none" stroke-linecap="round"/>')
    tx, ty = x + 6, y - h
    for dx, dy in ((-60, 10), (60, 14), (-40, -25), (45, -22), (0, -35)):
        add(f'<path d="M{tx} {ty} q{dx/2} {dy-20} {dx} {dy+20}" stroke="#2e7d32" stroke-width="12" fill="none" stroke-linecap="round"/>')
palm(300, 470, 210)
palm(1140, 480, 230)

# souvenir stall (back left)
add('<rect x="330" y="455" width="130" height="70" fill="#a1887f"/><path d="M318 455 h154 l-12 -36 h-130 z" fill="#4db6ac"/>'
    '<line x1="336" y1="455" x2="336" y2="525" stroke="#6d4c41" stroke-width="4"/>'
    '<line x1="454" y1="455" x2="454" y2="525" stroke="#6d4c41" stroke-width="4"/>'
    '<text x="395" y="445" font-family="DejaVu Sans" font-weight="bold" font-size="13" fill="#fff" text-anchor="middle">SOUVENIRS</text>')
for i, c in enumerate(["#ffca28", "#ef5350", "#7e57c2", "#26a69a"]):
    add(f'<rect x="{345+i*28}" y="470" width="20" height="26" rx="3" fill="{c}"/>')
add('<ellipse cx="370" cy="510" rx="18" ry="6" fill="#fdd835"/><path d="M356 510 q14 -22 28 0" fill="#fdd835"/>')
person(500, 545 - 85*0.7, 0.7, f=-1, skin="#e0ac69", hair="#212121", shirt="#5c6bc0", pants="#37474f",
       legs=((-6, 0), (6, 0)), arms=((10, 20), (60, 75)), hold=bag)

# street food cart (back middle)
add('<rect x="620" y="470" width="120" height="58" rx="6" fill="#ff8a65" stroke="#e64a19" stroke-width="2"/>'
    '<path d="M610 470 h140 l-10 -34 h-120 z" fill="#fff176"/>'
    '<text x="680" y="463" font-family="DejaVu Sans" font-weight="bold" font-size="13" fill="#e64a19" text-anchor="middle">LOCAL FOOD</text>'
    '<circle cx="640" cy="536" r="10" fill="#555"/><circle cx="720" cy="536" r="10" fill="#555"/>')
add('<path d="M640 472 q6 -12 12 0 M665 472 q6 -12 12 0" stroke="#bbb" stroke-width="2" fill="none"/>')
person(785, 550 - 85*0.7, 0.7, f=-1, skin="#f1c27d", hair="#3e2723", hstyle="long", shirt="#ec407a", pants="#455a64",
       skirt="#455a64", legs=((-5, 0), (5, 0)), arms=((10, 15), (40, 160)), hold=skewer, mouth="open")

# surfer on the sea
add('<ellipse cx="905" cy="395" rx="58" ry="8" fill="#ffeb3b" stroke="#f9a825" stroke-width="2"/>')
add('<path d="M845 400 q60 -30 120 0" stroke="#e3f2fd" stroke-width="5" fill="none"/>')
person(905, 392 - 85*0.62, 0.62, f=1, skin="#e0ac69", hair="#212121", shirt="#29b6f6", pants="#0d47a1",
       legs=((-25, 10), (25, -10)), arms=((-95, -100), (95, 100)), lean=-6)

# suitcase woman (front left) looking at map on phone, near hotel door
s = 0.88
person(205, 720 - 85*s, s, f=1, skin="#f1c27d", hair="#4e342e", hstyle="pony", shirt="#26a69a", pants="#5d4037",
       legs=((-10, -2), (12, 2)), arms=((-20, -15), (25, 160)), hold=phone, hold_back=suitcase)

# selfie friends (front middle)
s = 0.86
person(440, 725 - 85*s, s, f=1, skin="#e0ac69", hair="#212121", hstyle="long", shirt="#ffb300", pants="#1e88e5",
       legs=((-5, 0), (6, 0)), arms=((10, 20), (150, 165)), hold=phone)
person(500, 725 - 85*s, s, f=-1, skin="#f1c27d", hair="#3e2723", shirt="#ef5350", pants="#37474f",
       legs=((-5, 0), (6, 0)), arms=((10, 15), (40, 120)), mouth="open")

# sunbather on beach chair under umbrella (front right-middle)
add('<line x1="720" y1="735" x2="745" y2="575" stroke="#795548" stroke-width="5"/>')
add('<path d="M660 600 Q745 520 830 560 Z" fill="#ef5350"/><path d="M700 575 Q745 540 790 565" stroke="#fff" stroke-width="6" fill="none" opacity="0.7"/>')
add('<path d="M660 650 L700 700 L830 700" stroke="#1e88e5" stroke-width="9" fill="none" stroke-linecap="round"/>'
    '<line x1="705" y1="700" x2="700" y2="730" stroke="#555" stroke-width="4"/><line x1="820" y1="700" x2="825" y2="730" stroke="#555" stroke-width="4"/>')
person(712, 694, 0.78, f=1, skin="#e0ac69", hair="#212121", hstyle="long", shirt="#ab47bc", pants="#ab47bc",
       legs=((88, 92), (86, 90)), arms=((50, 60), (40, 75)), lean=55, mouth="smile")

# laptop guy at beach cafe (front right)
add('<rect x="960" y="640" width="120" height="8" fill="#8d6e63"/><rect x="1015" y="648" width="8" height="80" fill="#6d4c41"/>'
    '<rect x="995" y="726" width="50" height="6" fill="#6d4c41"/>')
add('<path d="M985 640 l40 0 l8 -32 l-40 0 z" fill="#90a4ae" stroke="#455a64" stroke-width="2"/><rect x="980" y="636" width="48" height="5" fill="#455a64"/>')
add('<circle cx="1060" cy="628" r="12" fill="#7cb342"/><line x1="1062" y1="618" x2="1068" y2="600" stroke="#e53935" stroke-width="2"/>')
add('<rect x="880" y="676" width="60" height="8" fill="#a1887f"/><line x1="885" y1="684" x2="885" y2="730" stroke="#6d4c41" stroke-width="5"/>'
    '<line x1="935" y1="684" x2="935" y2="730" stroke="#6d4c41" stroke-width="5"/><line x1="882" y1="676" x2="878" y2="620" stroke="#6d4c41" stroke-width="5"/>')
person(912, 676, 0.82, f=1, skin="#f1c27d", hair="#212121", shirt="#ffffff", pants="#37474f",
       legs=((85, 0), (90, 3)), arms=((40, 90), (50, 95)), mouth="smile")

add('</svg>')
import sys
open(sys.argv[1] if len(sys.argv) > 1 else "picture.svg", "w").write("\n".join(out))
