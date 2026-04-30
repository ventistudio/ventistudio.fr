#!/usr/bin/env python3
# _i18n_extract.py — Phase 2 : Extraction & injection data-i18n sur toutes les pages
# Usage : python _i18n_extract.py [--dry-run]

import os, re, json, sys, html as htmllib
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag, Comment

# Force UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

BASE = Path(r"C:\Users\starw\Documents\GitHub\ventistudio.eu")
FR_JSON_PATH = BASE / "locales" / "fr.json"
DRY_RUN = "--dry-run" in sys.argv

# ── Pages / dossiers à ignorer ───────────────────────────────────────────────
SKIP_DIRS = {
    "weblate", "node_modules", ".git", "locales",
    "admin", "protected", "restricted", "secret",
    "gmod", "a-files",
    "domain/aina", "domain/archive", "domain/maps", "domain/movie",
    "domain/peer", "domain/search", "domain/pro", "domain/suite",
    "player/game", "aokiunivers/nostromo", "aokiunivers/nostromo-terminal",
}

def should_skip_file(path: Path) -> str | None:
    rel = path.relative_to(BASE).as_posix()
    for d in SKIP_DIRS:
        if rel.startswith(d):
            return f"skip_dir:{d}"
    # Redirects courts
    try:
        size = path.stat().st_size
        if size < 600:
            return "too_small"
    except Exception:
        pass
    return None

# ── Préfixe de clé à partir du chemin ────────────────────────────────────────
def page_prefix(path: Path) -> str:
    rel = path.relative_to(BASE)
    parts = list(rel.parts)
    if parts[-1] == "index.html":
        parts = parts[:-1]
    else:
        parts[-1] = parts[-1].replace(".html", "")
    if not parts:
        return "home"
    # Normaliser
    return ".".join(
        p.replace("-", "_").replace(" ", "_").replace("&", "and")
        .replace("P&R", "pandr")
        .lower()
        for p in parts
    )

# ── Vérifications de contenu ──────────────────────────────────────────────────
def is_nav_or_footer(tag: Tag) -> bool:
    node = tag
    while node:
        if isinstance(node, Tag):
            if node.name in ("header", "footer", "nav"):
                return True
            ids = node.get("id", "")
            if ids in ("main-nav", "lang-switcher", "nav-burger", "user-button"):
                return True
            classes = node.get("class", [])
            if isinstance(classes, str):
                classes = classes.split()
            if any(c in ("main-nav", "nav-panel", "nav-group", "nav-col",
                         "controls", "logo", "theme-toggle")
                   for c in classes):
                return True
        node = node.parent if node.parent != node else None
    return False

def is_in_main(tag: Tag) -> bool:
    node = tag.parent
    while node:
        if isinstance(node, Tag) and node.name == "main":
            return True
        node = node.parent if node.parent != node else None
    return False

def text_looks_translatable(text: str) -> bool:
    text = text.strip()
    if len(text) < 2:
        return False
    # Numérique pur, URLs, codes
    if re.match(r'^[\d\s%+\-:./,]+$', text):
        return False
    if text.startswith("http"):
        return False
    # Emoji seul
    if len(text) <= 4 and all(ord(c) > 9000 for c in text.replace(" ", "")):
        return False
    return True

def has_inline_html(tag: Tag) -> bool:
    """Vrai si le tag contient des balises inline significatives (liens, strong, em)."""
    for child in tag.children:
        if isinstance(child, Tag) and child.name in ("a", "strong", "em", "code", "b", "i"):
            return True
    return False

def inner_html(tag: Tag) -> str:
    """Retourne le innerHTML du tag, SVG supprimés."""
    soup = BeautifulSoup(str(tag), "lxml")
    target = soup.find(tag.name)
    if not target:
        return tag.get_text(strip=True)
    for svg in target.find_all("svg"):
        svg.decompose()
    return target.decode_contents().strip()

# ── Résolution du contexte parent ─────────────────────────────────────────────
def parent_context(tag: Tag) -> str:
    node = tag.parent
    parts = []
    while node and isinstance(node, Tag) and node.name != "main":
        cid = node.get("id", "")
        if cid and cid not in ("main-nav", "user-button"):
            parts.insert(0, cid.replace("-", "_").lower())
            break
        classes = node.get("class", [])
        if isinstance(classes, str):
            classes = classes.split()
        # Garder la première classe courte et significative
        for c in classes:
            if 3 < len(c) < 30 and not c.startswith("nav"):
                parts.insert(0, c.replace("-", "_").lower())
                break
        node = node.parent
    return "_".join(parts[:2]) if parts else "page"

# ── Compteur de clés par préfixe ─────────────────────────────────────────────
_counters: dict[str, dict[str, int]] = {}

def make_key(prefix: str, tag_name: str, ctx: str) -> str:
    ns = f"{prefix}.{ctx}"
    if ns not in _counters:
        _counters[ns] = {}
    cnt = _counters[ns].get(tag_name, 0) + 1
    _counters[ns][tag_name] = cnt
    if cnt == 1:
        return f"{prefix}.{ctx}.{tag_name}"
    return f"{prefix}.{ctx}.{tag_name}{cnt}"

# ── Balises à traiter ─────────────────────────────────────────────────────────
EXTRACT_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6",
                "p", "button", "label", "li", "td", "th", "caption",
                "figcaption", "blockquote", "dt", "dd"}

# Pages légales : on n'extrait que les titres (pas chaque paragraphe)
LEGAL_TITLE_ONLY_DIRS = {
    "lawful/tos", "lawful/cgv", "lawful/cookies",
    "lawful/dmca", "lawful/dmcainfo", "lawful/license-fitsz-dma",
}

ATTR_TAGS = {"input": "placeholder", "textarea": "placeholder",
             "img": "alt", "a": "title"}

# ── Traitement d'une page ─────────────────────────────────────────────────────
def process_page(path: Path, fr_data: dict) -> tuple[dict, bool]:
    """Retourne (nouvelles_clés, html_modifié)."""
    raw = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(raw, "html.parser")

    prefix = page_prefix(path)
    _counters.clear()  # Réinitialiser les compteurs pour chaque page

    # Déterminer si c'est une page légale (extraction limitée)
    rel = path.relative_to(BASE).as_posix()
    legal_only = any(rel.startswith(d) for d in LEGAL_TITLE_ONLY_DIRS)
    extract_tags = {"h1", "h2", "h3", "h4", "h5", "h6", "button"} if legal_only else EXTRACT_TAGS

    new_keys: dict[str, str] = {}
    modified = False

    # ── 1. page.title et meta.description ───────────────────────────────────
    title_tag = soup.find("title")
    if title_tag and title_tag.string:
        k = f"{prefix}.page.title"
        if k not in fr_data:
            new_keys[k] = title_tag.string.strip()

    meta_desc = soup.find("meta", {"name": "description"})
    if meta_desc and meta_desc.get("content"):
        k = f"{prefix}.meta.description"
        if k not in fr_data:
            new_keys[k] = meta_desc["content"].strip()

    # ── 2. Éléments de contenu dans <main> ──────────────────────────────────
    main = soup.find("main")
    if not main:
        return new_keys, False

    for tag in main.find_all(True):
        if not isinstance(tag, Tag):
            continue
        if is_nav_or_footer(tag):
            continue
        if tag.name not in extract_tags:
            continue

        # Ignorer les enfants de tags déjà traités
        if tag.find_parent(EXTRACT_TAGS - {tag.name}):
            # Autoriser li dans ul qui n'est pas dans p, etc.
            pass

        # Ignorer si déjà data-i18n
        if tag.get("data-i18n") or tag.get("data-i18n-html"):
            continue

        # Texte
        text_raw = tag.get_text(separator=" ", strip=True)
        if not text_looks_translatable(text_raw):
            continue

        ctx = parent_context(tag)
        k = make_key(prefix, tag.name, ctx)

        use_html = has_inline_html(tag)
        value = inner_html(tag) if use_html else text_raw

        # Enregistrer la clé si nouvelle
        if k not in fr_data and k not in new_keys:
            new_keys[k] = htmllib.unescape(value)

        # Appliquer data-i18n sur le tag
        attr = "data-i18n-html" if use_html else "data-i18n"
        tag[attr] = k
        modified = True

    # ── 3. Attributs (placeholder, alt, title) ──────────────────────────────
    for el_name, attr_name in ATTR_TAGS.items():
        for tag in main.find_all(el_name, attrs={attr_name: True}):
            if tag.get("data-i18n-attr") and attr_name in tag.get("data-i18n-attr", ""):
                continue
            val = tag.get(attr_name, "").strip()
            if not text_looks_translatable(val):
                continue
            ctx = parent_context(tag)
            k = make_key(prefix, f"{el_name}_{attr_name}", ctx)
            if k not in fr_data and k not in new_keys:
                new_keys[k] = htmllib.unescape(val)

            existing = tag.get("data-i18n-attr", "")
            entry = f"{attr_name}:{k}"
            if entry not in existing:
                tag["data-i18n-attr"] = (existing + "," + entry).lstrip(",") if existing else entry
            modified = True

    # ── 4. aria-label hors nav ───────────────────────────────────────────────
    for tag in main.find_all(attrs={"aria-label": True}):
        if tag.get("data-i18n-attr") and "aria-label:" in tag.get("data-i18n-attr", ""):
            continue
        val = tag.get("aria-label", "").strip()
        if not text_looks_translatable(val):
            continue
        ctx = parent_context(tag)
        k = make_key(prefix, "aria", ctx)
        if k not in fr_data and k not in new_keys:
            new_keys[k] = htmllib.unescape(val)

        existing = tag.get("data-i18n-attr", "")
        entry = f"aria-label:{k}"
        if entry not in existing:
            tag["data-i18n-attr"] = (existing + "," + entry).lstrip(",") if existing else entry
        modified = True

    if modified:
        new_html = str(soup)
        # Corriger les entités HTML inutiles
        new_html = re.sub(r'&amp;(#\d+;)', r'&\1', new_html)
        return new_keys, new_html
    return new_keys, None

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # Charger fr.json
    fr_data: dict = {}
    if FR_JSON_PATH.exists():
        fr_data = json.loads(FR_JSON_PATH.read_text(encoding="utf-8"))

    all_new_keys: dict[str, str] = {}
    updated_pages = []
    skipped_pages = []
    already_ok = []
    errors = []

    html_files = sorted(BASE.rglob("*.html"))
    total = len(html_files)

    print(f"Traitement de {total} fichiers HTML...")
    print()

    for i, path in enumerate(html_files, 1):
        reason = should_skip_file(path)
        if reason:
            skipped_pages.append((path, reason))
            continue

        rel = path.relative_to(BASE).as_posix()
        try:
            new_keys, new_html = process_page(path, {**fr_data, **all_new_keys})

            if new_keys:
                all_new_keys.update(new_keys)
                print(f"  [{i}/{total}] +{len(new_keys)} cles -> {rel}")

            if new_html:
                if not DRY_RUN:
                    path.write_text(new_html, encoding="utf-8")
                updated_pages.append(rel)
            else:
                already_ok.append(rel)

        except Exception as e:
            errors.append((rel, str(e)))
            print(f"  [ERR] [{i}/{total}] ERREUR {rel}: {e}")

    # ── Mettre à jour fr.json ─────────────────────────────────────────────────
    if all_new_keys:
        fr_data.update(all_new_keys)
        # Trier les clés par namespace
        sorted_data = dict(sorted(fr_data.items()))
        if not DRY_RUN:
            FR_JSON_PATH.write_text(
                json.dumps(sorted_data, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )

    # ── Rapport ───────────────────────────────────────────────────────────────
    print()
    print("=" * 60)
    print("Resultat :")
    print(f"  Nouvelles cles fr.json : {len(all_new_keys)}")
    print(f"  Pages mises a jour     : {len(updated_pages)}")
    print(f"  Pages deja OK          : {len(already_ok)}")
    print(f"  Pages ignorees         : {len(skipped_pages)}")
    print(f"  Erreurs                : {len(errors)}")
    if DRY_RUN:
        print()
        print("  [DRY-RUN] Aucun fichier ecrit")
    print("=" * 60)

    if all_new_keys and DRY_RUN:
        print("\nApercu des 20 premieres nouvelles cles :")
        for k, v in list(all_new_keys.items())[:20]:
            v_short = v[:60].replace("\n", " ") + ("..." if len(v) > 60 else "")
            print(f"  {k!r}: {v_short!r}")

if __name__ == "__main__":
    main()
