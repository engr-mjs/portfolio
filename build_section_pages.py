#!/usr/bin/env python3
"""
Build per-section pages (projects/, experience/, stack/, certifications/,
gallery/, contact/) for the portfolio. The four content pages take their
layout inspiration from iging.vercel.app's per-section pages; every page
reuses the exact shared chrome (head, sidebar, mobile nav, modal, ask/typing
overlays) from index.html so the design stays in sync.

Run from the repo root:  python build_section_pages.py
Generated files are committed, so the site works without re-running this.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "index.html"

FEATHER = ('<svg viewBox="0 0 13 22" fill="currentColor" aria-hidden="true" class="h-[17px] w-auto shrink-0">'
           '<path d="M0 -4C2.1 -2.6 2.1 2.6 0 4C-2.1 2.6 -2.1 -2.6 0 -4Z" transform="translate(8 5) rotate(46)"/>'
           '<path d="M0 -4.3C2.3 -2.8 2.3 2.8 0 4.3C-2.3 2.8 -2.3 -2.8 0 -4.3Z" transform="translate(4.6 11) rotate(14)"/>'
           '<path d="M0 -4C2.1 -2.6 2.1 2.6 0 4C-2.1 2.6 -2.1 -2.6 0 -4Z" transform="translate(8 17) rotate(-30)"/></svg>')
FEATHER_M = '<span class="inline-flex -scale-x-100">' + FEATHER + '</span>'

PAGE_HEAD = '''      <!-- ── Page header ── -->
      <section class="pt-16 pb-6">
        <a href="../" class="font-mono text-[11px] uppercase tracking-wider text-gray-500 hover:text-ink">&larr; back to home</a>
        <h1 class="mt-4 font-pixel text-3xl leading-none sm:text-[2.6rem]">{title}</h1>
        <p class="mt-3 font-mono text-[12px] uppercase tracking-wider text-gray-400">{sub}</p>
      </section>
      <div aria-hidden="true" class="halftone halftone-wide mask-fade-x my-2 h-6 w-full opacity-[0.18]"></div>
'''


# ------------------------------------------------------------- shared bits

def inline_icon(name, cls='si-icon h-4 w-4'):
    """Inline a local brand SVG (assets/icons/<name>.svg) as a themed icon."""
    svg = (ROOT / 'assets' / 'icons' / f'{name}.svg').read_text(encoding='utf-8')
    return svg.replace('<svg ', f'<svg class="{cls}" ', 1)

# ------------------------------------------------------------- projects

def project_spotlight(key, num, title, eyebrow, desc, tags, hero, logo):
    tag_pills = "".join(
        f'<span class="rounded-full border border-gray-300 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gray-500">{t}</span>'
        for t in tags)
    featured = (f'<span class="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">'
                f'{FEATHER} Featured {FEATHER_M}</span>') if num == '01' else ''
    return f'''          <article class="overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_-24px_rgba(10,10,10,0.28)]">
            <button type="button" onclick="openLightbox('{key}', 0); return false;" class="group block w-full cursor-pointer" aria-label="{title} &mdash; view photos">
              <img src="../{hero}" alt="{title} photo" class="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]">
            </button>
            <div class="p-6">
              <div class="flex flex-wrap items-center gap-1.5">{featured}{tag_pills}</div>
              <div class="mt-4 flex items-center gap-3">
                <img src="../{logo}" alt="{title} logo" class="h-12 w-12 shrink-0 rounded-xl border border-gray-200 object-cover">
                <div>
                  <h2 class="font-pixel text-lg leading-tight text-ink">{title}</h2>
                  <p class="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-400">{eyebrow}</p>
                </div>
              </div>
              <p class="mt-3 text-[14px] leading-relaxed text-gray-600">{desc}</p>
              <div class="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                <a href="javascript:void(0)" onclick="openLightbox('{key}'); return false;" class="font-mono text-[11px] uppercase tracking-wider text-gray-500 hover:text-ink">view project &rarr;</a>
              </div>
            </div>
          </article>'''


def project_row(key, title, type_label, desc):
    return f'''          <a href="javascript:void(0)" onclick="openLightbox('{key}'); return false;" class="group grid grid-cols-12 items-baseline gap-x-4 gap-y-1 px-6 py-5 transition hover:bg-gray-50/70">
            <h3 class="col-span-12 font-pixel text-[15px] text-ink sm:col-span-4">{title}</h3>
            <p class="col-span-12 font-mono text-[9px] uppercase tracking-wider text-gray-400 sm:col-span-3">{type_label}</p>
            <p class="col-span-12 text-[13px] leading-relaxed text-gray-600 sm:col-span-4">{desc}</p>
            <span class="col-span-12 hidden text-right font-mono text-[11px] text-gray-300 transition group-hover:text-ink sm:col-span-1 sm:block">&rarr;</span>
          </a>'''

# ------------------------------------------------------------- experience

def experience_entry(initials, year, role, span, dur):
    return f'''          <li class="relative pb-10 pl-12 last:pb-0">
            <span class="absolute left-0 top-1 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-gray-300 bg-white font-pixel text-[10px] text-ink">{initials}</span>
            <div class="rounded-xl border border-gray-200 bg-white p-5">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h2 class="font-pixel text-lg text-ink">{role}</h2>
                <span class="font-mono text-[10px] uppercase tracking-wider text-gray-400">{year}</span>
              </div>
              <p class="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-400">{span} &middot; {dur}</p>
              <div aria-hidden="true" class="halftone halftone-fine mask-fade-x mt-4 h-4 w-full opacity-[0.14]"></div>
            </div>
          </li>'''

# ------------------------------------------------------------- stack

STACK_GROUPS = [
    ("Frontend &amp; UI", [("JavaScript", "javascript"), ("TypeScript", "typescript"), ("React", "react"),
                           ("Next.js", "nextdotjs"), ("React Native", "react"), ("Tailwind", "tailwindcss")]),
    ("Backend", [("Python", "python")]),
    ("Dev Tools &amp; Workflow", [("Git", "git"), ("Docker", "docker")]),
    ("IoT &amp; Embedded", [("Arduino", "arduino"), ("ESP32", "esp32"), ("Raspberry Pi", "raspberrypi")]),
]


def stack_group(num, title, items):
    pills = "\n".join(
        f'          <span class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-2.5 pr-3.5 text-[13px] text-gray-600">{inline_icon(ic)} {name}</span>'
        for name, ic in items)
    return f'''        <div>
          <h2 class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">{num:02d} &mdash; {title}</h2>
          <div class="mt-3 flex flex-wrap gap-2">
{pills}
          </div>
        </div>'''

# ------------------------------------------------------------- certifications

def cert_card(key, img, title, issuer, alt, meta=None):
    meta_line = f'              <p class="mt-1 font-mono text-[10px] text-gray-400">{meta}</p>\n' if meta else ''
    return f'''          <a href="javascript:void(0)" onclick="openLightbox('{key}'); return false;"
             class="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_-24px_rgba(10,10,10,0.28)] transition hover:-translate-y-1">
            <div class="overflow-hidden">
              <img src="../{img}" alt="{alt}" class="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]">
            </div>
            <div class="p-5">
              <h2 class="text-[15px] font-semibold leading-snug text-ink">{title}</h2>
              <p class="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-gray-400">{issuer}</p>
{meta_line}              <p class="mt-3 font-mono text-[11px] text-gray-400 transition group-hover:text-ink">&lt; VERIFY &gt;</p>
            </div>
          </a>'''

# ------------------------------------------------------------- pages

SECTIONS = {
    "projects": {
        "title": "projects",
        "sub": "04 projects &mdash; robotics &middot; iot &middot; embedded &middot; web",
        "body": PAGE_HEAD.format(title="projects", sub="04 projects &mdash; robotics &middot; iot &middot; embedded &middot; web")
                + '''      <!-- ── Spotlighted projects ── -->
      <section class="py-10">
        <div class="grid gap-5 lg:grid-cols-2">
''' + project_spotlight(
            "dewy", "01", "DEWY", "project 01 &mdash; robotics &middot; ai",
            "An AI-powered study companion bot for preschool children.",
            ["Raspberry Pi", "AI"], "assets/images/dewy/1.jpg", "assets/images/dewy/dewy_logo.jpg") + "\n" + project_spotlight(
            "liwanav", "03", "LIWANAV", "project 03 &mdash; iot &middot; embedded",
            "GPS-powered stopover notification system with voice-guided announcements.",
            ["ESP32", "IoT"], "assets/images/liwanav/1.jpg", "assets/images/liwanav/liwanav_logo.png") + '''
        </div>
      </section>

      <!-- ── Everything else ── -->
      <section class="pb-10">
        <div class="divide-y divide-gray-100 rounded-2xl bg-white shadow-[0_14px_40px_-24px_rgba(10,10,10,0.28)]">
''' + project_row(
            "taskflow", "TASKFLOW", "IoT &middot; embedded",
            "GPS-powered stopover notification system with voice announcements.") + "\n" + project_row(
            "ambient", "AMBIENT LIGHT", "IoT &middot; web",
            "IoT ambient light with web control.") + '''
        </div>
      </section>
''',
    },
    "experience": {
        "title": "experience",
        "sub": "3+ yrs building &mdash; treasurer &middot; project developer &middot; hardware enthusiast",
        "body": PAGE_HEAD.format(title="experience", sub="3+ yrs building &mdash; treasurer &middot; project developer &middot; hardware enthusiast")
                + '''      <!-- ── Timeline ── -->
      <section class="py-10">
        <ol class="relative border-l border-gray-200">
''' + "\n".join([
            experience_entry("TR", "2024", "Treasurer", "2024 &mdash; 2027", "3 yrs"),
            experience_entry("PD", "2023", "Project Developer", "2023 &mdash; 2027", "4 yrs"),
            experience_entry("HE", "2023", "Hardware Enthusiast", "2023 &mdash; 2024", "1 yr"),
        ]) + '''
        </ol>
      </section>
''',
    },
    "stack": {
        "title": "stack",
        "sub": "12+ tools &amp; technologies I work with",
        "body": PAGE_HEAD.format(title="stack", sub="12+ tools &amp; technologies I work with")
                + '''      <!-- ── Stack groups ── -->
      <section class="flex flex-col gap-9 py-10">
''' + "\n".join(stack_group(i, t, items) for i, (t, items) in enumerate(STACK_GROUPS, 1)) + '''
      </section>
''',
    },
    "certifications": {
        "title": "certifications",
        "sub": "04 credentials &mdash; trainings &middot; seminars &middot; certifications",
        "body": PAGE_HEAD.format(title="certifications", sub="04 credentials &mdash; trainings &middot; seminars &middot; certifications")
                + '''      <!-- ── Trainings ── -->
      <section class="py-10">
        <h2 class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">01 &mdash; Trainings</h2>
        <div class="mt-4 grid gap-5 sm:grid-cols-2">
''' + cert_card(
            "cert-bootcamp", "assets/images/it-bootcamp-cert.png",
            "AI Learning Series: I.T. Boot Camp", "STI College Batangas", "I.T. Boot Camp certificate") + "\n" + cert_card(
            "cert-java", "assets/images/java-fundamentals-cert.png",
            "Java Fundamentals", "Oracle Academy &middot; Jun 2024", "Java Fundamentals certificate") + '''
        </div>
      </section>
      <!-- ── Seminars ── -->
      <section class="py-10">
        <h2 class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">02 &mdash; Seminars</h2>
        <div class="mt-4 grid gap-5 sm:grid-cols-2">
''' + cert_card(
            "cert-ymih", "assets/images/ymih-cert.jpg",
            "Youth Can Make It Happen: Academic Roadshow", "Leadership &amp; Community Service", "YMIH certificate") + '''
        </div>
      </section>
      <!-- ── Professional certifications ── -->
      <section class="py-10">
        <h2 class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">03 &mdash; Professional Certifications</h2>
        <div class="mt-4 grid gap-5 sm:grid-cols-2">
''' + cert_card(
            "cert-solidedge", "assets/images/solid-edge-cert.png",
            "Solid Edge Associate Level Certification", "Siemens Digital Industries Software &middot; Nov 2025",
            "Solid Edge certificate", meta="cert id 21124-176-422-2514") + '''
        </div>
      </section>
''',
    },
    "gallery": {
        "title": "gallery",
        "sub": "photos of builds, experiments &amp; behind the scenes",
        "body": PAGE_HEAD.format(title="gallery", sub="photos of builds, experiments &amp; behind the scenes")
                + '''      <!-- ── Gallery placeholder ── -->
      <section class="py-10">
        <div class="rounded-xl border border-dashed border-gray-300 py-20 text-center">
          <p class="font-pixel text-sm text-gray-300">coming soon</p>
          <p class="mt-2 font-mono text-[11px] text-gray-400">photos of builds, experiments &amp; behind the scenes</p>
        </div>
      </section>
''',
    },
    "contact": {
        "title": "contact",
        "sub": "for work, collabs &amp; everything else",
        "body": PAGE_HEAD.format(title="contact", sub="for work, collabs &amp; everything else")
                + '''      <!-- ── Contact info ── -->
      <section class="py-10">
        <div class="divide-y divide-gray-200 border-y border-gray-200">
          <div class="group grid grid-cols-12 items-baseline gap-3 py-2.5 hover:bg-gray-50/80">
            <div class="col-span-4 font-mono text-[11px] uppercase tracking-wider text-gray-400">phone</div>
            <a href="tel:+639948855483" class="col-span-8 text-[14px] font-medium text-ink hover:text-gray-500">+63 994-885-5483</a>
          </div>
          <div class="group grid grid-cols-12 items-baseline gap-3 py-2.5 hover:bg-gray-50/80">
            <div class="col-span-4 font-mono text-[11px] uppercase tracking-wider text-gray-400">email</div>
            <a href="mailto:engr.markjosephsilang@gmail.com" class="col-span-8 break-all text-[14px] font-medium text-ink hover:text-gray-500">engr.markjosephsilang@gmail.com</a>
          </div>
          <div class="group grid grid-cols-12 items-baseline gap-3 py-2.5 hover:bg-gray-50/80">
            <div class="col-span-4 font-mono text-[11px] uppercase tracking-wider text-gray-400">location</div>
            <div class="col-span-8 text-[14px] font-medium text-ink">Batangas City, Philippines</div>
          </div>
        </div>

        <form id="contactForm" class="mt-8" action="https://formspree.io/f/xaqrkkoj" method="POST" onsubmit="handleSubmit(event)">
          <div class="mb-4 flex items-baseline justify-between">
            <h3 class="font-mono text-[11px] uppercase tracking-wider text-gray-400">send a message</h3>
          </div>
          <div class="grid gap-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <input type="text" name="name" placeholder="Name" required
                     class="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-[13px] text-ink placeholder:text-gray-400 outline-none transition focus:border-ink">
              <input type="email" name="email" placeholder="Email" required
                     class="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-[13px] text-ink placeholder:text-gray-400 outline-none transition focus:border-ink">
            </div>
            <textarea name="message" placeholder="Message" rows="4" required
                      class="w-full resize-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-[13px] text-ink placeholder:text-gray-400 outline-none transition focus:border-ink"></textarea>
            <div class="flex items-center justify-between gap-3">
              <button type="submit" id="contactSubmit"
                      class="rounded-lg bg-ink px-4 py-2.5 text-[12px] font-medium text-white transition hover:bg-gray-800">Send message</button>
              <p id="contactStatus" class="font-mono text-[11px] text-gray-400"></p>
            </div>
          </div>
        </form>
      </section>
''',
    },
}

# ---------------------------------------------------------------- assembly

NAV_SECTIONS = ["projects", "experience", "stack", "certifications", "gallery", "contact"]


def build_page(section):
    html = SRC.read_text(encoding="utf-8")

    # 1. head with new title (keep the FULL head — fonts, tailwind CDN, config)
    head, rest = html.split("</head>", 1)
    old_title = re.search(r"<title>.*?</title>", head)
    if old_title:
        head = head.replace(old_title.group(0), f"<title>{section.title()} &mdash; Mark Joseph Silang</title>")
    # section pages live one level deep: prefix relative head assets (style.css, favicon)
    head = (head.replace('href="css/', 'href="../css/')
                .replace('href="assets/', 'href="../assets/')
                .replace('src="assets/', 'src="../assets/'))
    out = [head + "</head>"]

    # 2. chrome part A: body open → MAIN marker
    part_a, rest = rest.split("<!-- ═══════════════ MAIN", 1)
    part_a = part_a.replace("<body>", '<body data-base="..">')
    part_a = part_a.replace('href="#top"', 'href="../"')
    for s in NAV_SECTIONS:
        part_a = part_a.replace(f'href="#{s}"', f'href="../{s}/"')
        part_a = part_a.replace(f'href="{s}/"', f'href="../{s}/"')
    # active section state (both desktop sidebar + mobile nav links)
    part_a = part_a.replace(f'href="../{section}/"', f'href="../{section}/" aria-current="page"')
    # desktop: gray-500 → ink on the active link (glow is applied via CSS on aria-current)
    part_a = part_a.replace(
        f'href="../{section}/" aria-current="page" class="relative inline-flex w-fit items-center gap-2.5 text-gray-500 hover:text-ink">',
        f'href="../{section}/" aria-current="page" class="relative inline-flex w-fit items-center gap-2.5 text-ink hover:text-ink">')
    # mobile: gray-700 → ink on the active link
    part_a = part_a.replace(
        f'href="../{section}/" aria-current="page" onclick="closeMobileNav()" class="relative inline-flex w-fit items-center gap-3 text-gray-700 hover:text-ink">',
        f'href="../{section}/" aria-current="page" onclick="closeMobileNav()" class="relative inline-flex w-fit items-center gap-3 text-ink">')
    out.append(part_a)

    # 3. main open tag
    main_open, rest = rest.split("<div class=\"mx-auto max-w-2xl px-6\">", 1)
    out.append(main_open + '<div class="mx-auto max-w-2xl px-6">')

    # 4. section body
    out.append(SECTIONS[section]["body"])

    # 5. close main + tail (modal / ask / typing / script)
    _, rest = rest.split("</main>", 1)
    out.append("</div>\n  </main>")
    tail = rest.replace('<script src="js/main.js"></script>', '<script src="../js/main.js"></script>')
    out.append(tail)

    page = "\n".join(out)
    dest = ROOT / section / "index.html"
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(page, encoding="utf-8")
    print(f"wrote {dest.relative_to(ROOT)}  ({len(page):,} bytes)")


if __name__ == "__main__":
    for s in SECTIONS:
        build_page(s)
    print("done.")
