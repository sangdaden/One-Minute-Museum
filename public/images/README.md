# Image assets — One-Minute Museum

```
public/images/
  demo/        # generic UI / demo / mood images (Unsplash, Pexels)
  culture/     # Vietnamese cultural / historical / artifact images (Wikimedia Commons preferred)
  patterns/    # decorative SVG/PNG motifs (Đông Sơn, paper texture)
```

## Sources & policy

| Source | Use for | Attribution |
|---|---|---|
| **Wikimedia Commons** | Cultural, historical, museum, artifact, heritage images (**preferred**) | Required — author + license (CC, public domain) |
| **Unsplash** | Generic UI / demo / visual mood images | Author + Unsplash License |
| **Pexels** | Generic visual mood / demo images | Author + Pexels License |
| **User upload** | The main product input | n/a |

**Rules**

- Do **not** commit copyrighted images directly.
- Do **not** use any image without source + attribution metadata
  (`source`, `author`, `license`, `sourceUrl`).
- The curation pipeline (`lib/image-curation/`) normalizes every result to an
  `ImageCandidate` that carries this metadata, and the UI shows it via
  `ImageCredits`.
- If an actual file is missing, the UI falls back to a warm gradient placeholder
  instead of a broken image — so these placeholder paths are safe to reference:
  - `/images/demo/hue-imperial-city.jpg`
  - `/images/demo/hoi-an-lantern.jpg`
  - `/images/culture/dong-son-drum.jpg`
  - `/images/culture/water-puppet.jpg`
  - `/images/patterns/dong-son-pattern.svg`
  - `/images/patterns/paper-texture.svg`

See `lib/image-curation/README.md` for the pipeline + environment variables.
