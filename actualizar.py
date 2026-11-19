"""Actualiza data.js a partir de datos.json sin dependencias externas."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / "datos.json").read_text(encoding="utf-8-sig"))
expected = {"chatgpt_sites", "lovable", "vercel", "github_pages", "render", "cloudflare"}
states = {"included", "configurable", "external", "limited", "not_native", "conditional"}
if {p["id"] for p in data["platforms"]} != expected or len(data["platforms"]) != 6:
    raise ValueError("Se esperan las seis plataformas originales y sus identificadores.")
if set(data["status_legend"]) != states:
    raise ValueError("Conserva los seis estados originales.")
for platform in data["platforms"]:
    for key in ("database", "user_accounts", "file_storage", "background_work"):
        if platform["backend_components"][key]["status"] not in states:
            raise ValueError(f"Estado desconocido en {platform['id']} / {key}")
data_js = "window.DEPLOYMENT_DATA = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
(ROOT / "data.js").write_text(data_js, encoding="utf-8")
html_path = ROOT / "index.html"
html = html_path.read_text(encoding="utf-8")
for identifier, source, initial in (
    ("app-styles", (ROOT / "styles.css").read_text(encoding="utf-8"), '<link rel="stylesheet" href="styles.css">'),
    ("app-data", data_js, '<script src="data.js"></script>'),
    ("app-code", (ROOT / "app.js").read_text(encoding="utf-8"), '<script src="app.js"></script>'),
):
    tag = "style" if identifier == "app-styles" else "script"
    source = source.replace("</script", "<\\/script")
    block = f'<{tag} id="{identifier}">\n{source}\n</{tag}>'
    pattern = rf'<{tag} id="{identifier}">.*?</{tag}>'
    if re.search(pattern, html, flags=re.DOTALL):
        html = re.sub(pattern, lambda _: block, html, flags=re.DOTALL)
    elif initial in html:
        html = html.replace(initial, block)
    else:
        raise ValueError(f"No se encontró el bloque {identifier} en index.html")
html_path.write_text(html, encoding="utf-8")
print("index.html autónomo actualizado con los datos de las seis plataformas.")
