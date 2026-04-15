import { parse } from "yaml";
import profileRaw from "./profile.yaml?raw";
import trainingRaw from "./training.yaml?raw";
import racesRaw from "./races.yaml?raw";

const languages = ["ca", "es", "en"];
const profileSource = parse(profileRaw) ?? {};
const trainingSource = parse(trainingRaw) ?? {};
const racesSource = parse(racesRaw) ?? {};

const isLocalizedRecord = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  languages.some((key) => key in value);

const pickLocalized = (value, lang) => {
  if (value == null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => pickLocalized(item, lang)).filter(Boolean);
  }

  if (isLocalizedRecord(value)) {
    return value[lang] ?? value.ca ?? value.es ?? value.en ?? "";
  }

  return value;
};

const isPublished = (value) => {
  if (value == null || value === "") {
    return true;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return !["0", "false", "no", "n", "draft"].includes(`${value}`.trim().toLowerCase());
};

const sortByOrder = (items, fallbackField) =>
  [...items]
    .map((item, index) => ({ ...item, __index: index }))
    .sort((left, right) => {
      const leftOrder = Number(left.sort_order ?? Number.MAX_SAFE_INTEGER);
      const rightOrder = Number(right.sort_order ?? Number.MAX_SAFE_INTEGER);

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      if (fallbackField) {
        return `${right[fallbackField] ?? ""}`.localeCompare(`${left[fallbackField] ?? ""}`);
      }

      return left.__index - right.__index;
    })
    .map(({ __index, ...item }) => item);

const reverseByYamlOrder = (items) => [...items].reverse();

const localizeProfile = (profile, lang) => ({
  name: pickLocalized(profile.name, lang),
  headline: pickLocalized(profile.headline, lang),
  bio: pickLocalized(profile.bio, lang),
  location: pickLocalized(profile.location, lang),
  contact: {
    instagramCta: pickLocalized(profile.contact?.instagram_cta, lang),
    instagram: pickLocalized(profile.contact?.instagram, lang)
  },
  photo: {
    src: pickLocalized(profile.photo?.src, lang) || "/images/profile-placeholder.svg",
    alt: pickLocalized(profile.photo?.alt, lang)
  }
});

const localizeTraining = (entry, lang) => ({
  year: entry.year ?? "",
  title: pickLocalized(entry.title, lang),
  institution: pickLocalized(entry.institution, lang),
  description: pickLocalized(entry.description, lang)
});

const localizeRace = (entry, lang) => ({
  date: entry.date ?? entry.year ?? "",
  name: pickLocalized(entry.race_name ?? entry.name, lang),
  driver: pickLocalized(entry.driver, lang),
  vehicle: pickLocalized(entry.car ?? entry.vehicle, lang),
  category: pickLocalized(entry.race_type ?? entry.category, lang),
  result: pickLocalized(entry.final_class_position ?? entry.result, lang)
});

const localizeSkills = (skills, lang) => {
  const grouped = new Map();

  for (const entry of sortByOrder(skills.filter((item) => isPublished(item.published)))) {
    const group = pickLocalized(entry.group, lang);
    const item = pickLocalized(entry.skill ?? entry.name, lang);

    if (!group || !item) {
      continue;
    }

    const items = grouped.get(group) ?? [];
    items.push(item);
    grouped.set(group, items);
  }

  return Array.from(grouped.entries()).map(([group, items]) => ({ group, items }));
};

const summarizeRaces = (races, lang) => {
  const counts = new Map();

  for (const race of races) {
    const category = pickLocalized(race.race_type ?? race.category, lang);
    if (!category) {
      continue;
    }

    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category));
};

export const ui = {
  siteName: Object.fromEntries(
    languages.map((lang) => [lang, pickLocalized(profileSource.site?.site_name, lang) || "Rally Raid Codriver CV"])
  ),
  tagline: Object.fromEntries(languages.map((lang) => [lang, pickLocalized(profileSource.site?.tagline, lang)])),
  languages: profileSource.site?.languages ?? [
    { code: "ca", label: "CAT" },
    { code: "es", label: "ESP" },
    { code: "en", label: "ENG" }
  ],
  labels: Object.fromEntries(
    languages.map((lang) => [
      lang,
      Object.fromEntries(
        Object.entries(profileSource.site?.labels ?? {}).map(([key, value]) => [key, pickLocalized(value, lang)])
      )
    ])
  )
};

export const getCvData = (lang) => {
  const training = sortByOrder(
    (trainingSource.training ?? []).filter((item) => isPublished(item.published)),
    "year"
  ).map((entry) => localizeTraining(entry, lang));

  const races = reverseByYamlOrder((racesSource.races ?? []).filter((item) => isPublished(item.published))).map(
    (entry) => localizeRace(entry, lang)
  );

  return {
    lang,
    meta: {
      title: pickLocalized(profileSource.profile?.meta_title, lang) || "Rally raid codriver CV",
      description: pickLocalized(profileSource.profile?.meta_description, lang) || "Live CV"
    },
    profile: localizeProfile(profileSource.profile ?? {}, lang),
    training,
    races,
    skills: localizeSkills(profileSource.skills ?? [], lang),
    raceSummary: summarizeRaces(
      reverseByYamlOrder((racesSource.races ?? []).filter((item) => isPublished(item.published))),
      lang
    )
  };
};
