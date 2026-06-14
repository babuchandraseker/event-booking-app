import { useEffect } from "react";

const SITE_NAME = "A WonderOne Surprise";
const SITE_URL = "https://www.awonderone.com";
const DEFAULT_IMAGE = "/themes/romantic/romantic1.jpg";

/**
 * SEO component — sets document.title and all relevant meta tags.
 * Drop this into any page component and pass the props you need.
 *
 * @param {string}  title        - Page title (without site name suffix)
 * @param {string}  description  - Meta description
 * @param {string}  [canonical]  - Canonical path, e.g. "/gallery"
 * @param {string}  [image]      - OG/Twitter image path
 * @param {string}  [type]       - OG type, default "website"
 * @param {string[]} [keywords]  - Optional keyword array
 */
export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  keywords,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalHref = canonical
      ? `${SITE_URL}${canonical}`
      : window.location.href;
    const imageAbsolute = image.startsWith("http")
      ? image
      : `${SITE_URL}${image}`;

    // Title
    document.title = fullTitle;

    // Helper to set or create a meta tag
    function setMeta(selector, attr, value) {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        if (attr === "property") {
          tag.setAttribute("property", selector.match(/\[property="([^"]+)"\]/)?.[1] || "");
        } else {
          tag.setAttribute("name", selector.match(/\[name="([^"]+)"\]/)?.[1] || "");
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    }

    function setLink(selector, attr, value) {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement("link");
        tag.setAttribute("rel", selector.match(/\[rel="([^"]+)"\]/)?.[1] || "");
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, value);
    }

    // Standard meta
    setMeta('[name="description"]', "content", description || "");
    if (keywords?.length) {
      setMeta('[name="keywords"]', "content", keywords.join(", "));
    }
    setMeta('[name="robots"]', "content", "index, follow");

    // Canonical
    setLink('[rel="canonical"]', "href", canonicalHref);

    // Open Graph
    setMeta('[property="og:type"]', "property", type);
    setMeta('[property="og:title"]', "property", fullTitle);
    setMeta('[property="og:description"]', "property", description || "");
    setMeta('[property="og:url"]', "property", canonicalHref);
    setMeta('[property="og:image"]', "property", imageAbsolute);
    setMeta('[property="og:site_name"]', "property", SITE_NAME);
    setMeta('[property="og:locale"]', "property", "en_IN");

    // Twitter
    setMeta('[name="twitter:card"]', "content", "summary_large_image");
    setMeta('[name="twitter:title"]', "content", fullTitle);
    setMeta('[name="twitter:description"]', "content", description || "");
    setMeta('[name="twitter:image"]', "content", imageAbsolute);
  }, [title, description, canonical, image, type, keywords]);

  return null;
}
