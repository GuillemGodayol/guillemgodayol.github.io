# rally_cv

Static multilingual rally raid codriver CV fed directly from three local YAML files.

## Stack

- Astro for the site
- GitHub Pages for hosting
- GitHub Actions for build and deploy
- Three editable YAML files with language-specific fields

## Content source

Edit:

- [`src/data/profile.yaml`]
- [`src/data/training.yaml`]
- [`src/data/races.yaml`]

## File structure

- `profile.yaml`: site labels, profile, and skills
- `training.yaml`: one training entry per item
- `races.yaml`: one race entry per item

For translated text, use language keys inside the same field:

```yaml
headline:
  ca: "Text en catala"
  es: "Texto en espanol"
  en: "English text"
```

For non-translated values, use a plain scalar:

```yaml
car: "Toyota Land Cruiser"
```

## Race entry example

Each race is one YAML item in [`races.yaml`], so updating the CV means adding one block like this:

```yaml
- year: "2026"
  date: "2026-04"
  race_name: "Race name"
  driver: "Nom del pilot"
  car: "Toyota Land Cruiser"
  final_class_position: "5"
  race_type:
    ca: "Rally raid"
    es: "Rally raid"
    en: "Rally raid"
```

Optional fields supported in list items:

- `published`: hide an entry without deleting it
- `sort_order`: force a custom order

By default, races are shown in reverse order of how they appear in `races.yaml`, so you can append new entries at the bottom.

## Training entry example

Each training item is one YAML item in [`training.yaml`]:

```yaml
- year: "2025"
  title:
    ca: "Curs de navegacio"
    es: "Curso de navegacion"
    en: "Navigation course"
  institution: "Off-Road Academy"
  description:
    ca: "Resum curt"
    es: "Resumen corto"
    en: "Short summary"
```

## Profile and skills

[`profile.yaml`]contains:

- site title and UI labels
- your presentation/profile data
- the skills section