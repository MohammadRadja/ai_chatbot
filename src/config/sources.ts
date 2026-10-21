export type SourceKind =
  | "clinic"
  | "package"
  | "video"
  | "price-list"
  | "comparison";

export type KnowledgeSourceConfig = {
  key: string;
  title: string;
  kind: SourceKind;
  url: string;
};

export const KNOWLEDGE_SOURCES: readonly KnowledgeSourceConfig[] = [
  {
    key: "itc-profile",
    title: "ITC Immunity Therapy Center profile",
    kind: "clinic",
    url: "https://www.placidway.com/profile/5/Alternative-Cancer-Treatment-by-ITC-Immunity-Therapy-Center",
  },
  {
    key: "adenocarcinoma-package",
    title: "Alternative adenocarcinoma cancer treatment package",
    kind: "package",
    url: "https://www.placidway.com/package/7903/Alternative-Adenocarcinoma-Cancer-Treatment-Package-in-Tijuana-Mexico-by-ITC",
  },
  {
    key: "adrenal-package",
    title: "Alternative adrenal cancer treatment package",
    kind: "package",
    url: "https://www.placidway.com/package/7902/Alternative-Adrenal-Cancer-Treatment-Package-in-Tijuana-Mexico-by-ITC",
  },
  {
    key: "anal-package",
    title: "Alternative anal cancer treatment package",
    kind: "package",
    url: "https://www.placidway.com/package/7901/Alternative-Anal-Cancer-Treatment-Package-in-Tijuana-Mexico-by-ITC",
  },
  {
    key: "itc-videos",
    title: "ITC Tijuana videos",
    kind: "video",
    url: "https://www.placidway.com/profile-videos/5/Alternative-Cancer-Treatment-by-ITC-Immunity-Therapy-Center",
  },
  {
    key: "itc-price-list",
    title: "ITC Immunity Therapy Center price list",
    kind: "price-list",
    url: "https://www.placidway.com/price-list/5/Alternative-Cancer-Treatment-by-ITC-Immunity-Therapy-Center",
  },
  {
    key: "alternative-medicine-comparison",
    title: "Alternative medicine cost comparison",
    kind: "comparison",
    url: "https://www.placidway.com/search-medical-pricings/Alternative-Medicine/All/1",
  },
];

export const ALLOWED_SOURCE_URLS = new Set(
  KNOWLEDGE_SOURCES.map((source) => source.url),
);

export function getSourceConfigByUrl(url: string) {
  return KNOWLEDGE_SOURCES.find((source) => source.url === url);
}
