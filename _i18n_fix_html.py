#!/usr/bin/env python3
# _i18n_fix_html.py — Corrige data-i18n → data-i18n-html pour les éléments
# qui ont un nœud texte suivi d'un enfant HTML (span, etc.)
# Usage : python _i18n_fix_html.py [--dry-run]

import sys, io, re, json, html as htmllib
from pathlib import Path
from bs4 import BeautifulSoup, Tag, NavigableString

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE = Path(r"C:\Users\starw\Documents\GitHub\ventistudio.eu")
FR_JSON_PATH = BASE / "locales" / "fr.json"
DRY_RUN = "--dry-run" in sys.argv

def inner_html_no_svg(tag: Tag) -> str:
    """Retourne l'innerHTML du tag sans les SVG."""
    from copy import copy
    t = BeautifulSoup(str(tag), "html.parser").find(tag.name)
    if not t:
        return tag.get_text(strip=True)
    for svg in t.find_all("svg"):
        svg.decompose()
    return t.decode_contents().strip()

def has_text_before_element(tag: Tag) -> bool:
    """Vrai si le tag a un nœud texte non vide avant un premier enfant élément."""
    for child in tag.children:
        if isinstance(child, NavigableString):
            if child.strip():
                return True
            # whitespace text node, continue
        elif isinstance(child, Tag):
            # Found an element - if we reach here with a prior non-empty text, return True
            # This just checks if we found ANY non-empty text (could be before or after)
            break
    # More precise: check if first non-whitespace child is a text node
    children = list(tag.children)
    for child in children:
        if isinstance(child, NavigableString):
            if child.strip():
                return True  # First non-empty content is text
        elif isinstance(child, Tag):
            return False  # First non-empty content is an element
    return False

def is_in_nav_or_footer(tag: Tag) -> bool:
    node = tag.parent
    while node:
        if isinstance(node, Tag) and node.name in ("header", "footer", "nav"):
            return True
        node = node.parent if node.parent != node else None
    return False


FORM_ELEMENTS = {"input", "select", "textarea", "button", "br", "script", "svg", "img"}

def needs_html_mode(tag: Tag) -> bool:
    """Vrai si l'élément a des enfants HTML significatifs ET un nœud texte non vide avant."""
    # Ignorer les éléments de formulaire (labels avec input, etc.)
    if tag.name == "label":
        return False
    # Ignorer si les enfants ne sont que des éléments de formulaire/br/svg
    significant_children = [
        c for c in tag.children
        if isinstance(c, Tag) and c.name not in FORM_ELEMENTS
    ]
    if not significant_children:
        return False
    # Ignorer les spans purement décoratifs (vides ou avec class de décoration)
    real_children = []
    for c in significant_children:
        if isinstance(c, Tag) and c.name == "span":
            text = c.get_text(strip=True)
            if not text:  # span vide (décoration)
                continue
        real_children.append(c)
    if not real_children:
        return False
    # Vérifie si le premier nœud significatif est du texte
    for child in tag.children:
        if isinstance(child, NavigableString) and child.strip():
            return True
        elif isinstance(child, Tag) and child.name not in FORM_ELEMENTS:
            return False
    return False

def main():
    fr_data = json.loads(FR_JSON_PATH.read_text("utf-8"))
    updated_files = 0
    updated_keys = 0

    html_files = sorted(BASE.rglob("*.html"))

    for path in html_files:
        rel = path.relative_to(BASE).as_posix()
        if any(rel.startswith(d) for d in ("weblate", "node_modules", ".git")):
            continue

        try:
            raw = path.read_text("utf-8")
        except Exception:
            continue

        # Chercher les éléments data-i18n qui ont du texte + enfant HTML
        soup = BeautifulSoup(raw, "html.parser")
        modified = False

        for tag in soup.find_all(attrs={"data-i18n": True}):
            if tag.get("data-i18n-html"):
                continue
            if is_in_nav_or_footer(tag):
                continue
            key = tag.get("data-i18n", "")
            if not key:
                continue

            if not needs_html_mode(tag):
                continue

            # Corriger : data-i18n → data-i18n-html
            html_val = inner_html_no_svg(tag)
            del tag["data-i18n"]
            tag["data-i18n-html"] = key

            # Mettre à jour fr.json avec la valeur HTML
            old_val = fr_data.get(key, "")
            new_val = htmllib.unescape(html_val)
            if old_val != new_val:
                fr_data[key] = new_val
                updated_keys += 1
                if DRY_RUN:
                    print(f"  [key] {key}")
                    print(f"    old: {repr(old_val[:80])}")
                    print(f"    new: {repr(new_val[:80])}")

            modified = True

        if modified:
            new_html = str(soup)
            new_html = re.sub(r'&amp;(#\d+;)', r'&\1', new_html)
            if not DRY_RUN:
                path.write_text(new_html, "utf-8")
            updated_files += 1
            print(f"  [fix] {rel}")

    if not DRY_RUN:
        sorted_data = dict(sorted(fr_data.items()))
        FR_JSON_PATH.write_text(
            json.dumps(sorted_data, ensure_ascii=False, indent=2),
            "utf-8"
        )

    print()
    print("=" * 60)
    print(f"  Fichiers corriges : {updated_files}")
    print(f"  Cles mises a jour : {updated_keys}")
    if DRY_RUN:
        print("  [DRY-RUN] Aucun fichier ecrit")
    print("=" * 60)

if __name__ == "__main__":
    main()
