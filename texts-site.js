
/* Texts — Pages CMS */

(async function () {
  const root = document.getElementById("texts-root");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const lang = params.get("lang") === "en" ? "en" : "ko";
  const id = params.get("id");

  document.documentElement.lang = lang;

  const categories = {
    "artist-statement": ["작가노트", "Artist Statement"],
    "critical-essay": ["평론", "Critical Essay"],
    "review": ["리뷰", "Review"],
    "interview": ["인터뷰", "Interview"],
    "other": ["기타", "Other"]
  };

  function make(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) {
      element.textContent = content;
    }
    return element;
  }

  function translated(item, key) {
    return String(
      item[key + "_" + lang] ||
      item[key + "_ko"] ||
      item[key + "_en"] ||
      ""
    ).trim();
  }

  function categoryName(item) {
    const pair = categories[item.category] || categories.other;
    return pair[lang === "en" ? 1 : 0];
  }

  function languageSwitch() {
    const nav = make("nav", "texts-language");
    nav.setAttribute("aria-label", "Language");

    ["ko", "en"].forEach(code => {
      const link = make(
        "a",
        "",
        code === "ko" ? "KR" : "EN"
      );

      const query = new URLSearchParams(location.search);
      query.set("lang", code);

      link.href = "texts.html?" + query.toString();

      if (code === lang) {
        link.setAttribute("aria-current", "page");
      }

      nav.appendChild(link);

      if (code === "ko") {
        nav.appendChild(make("span", "", "/"));
      }
    });

    return nav;
  }

  function heading(title, subtitle) {
    const header = make("header", "texts-heading");
    const kicker = make(
      "p", "texts-kicker", "04 / TEXTS"
    );

    const titleElement = make("h1", "texts-title", title);
    const dot = make("span", "texts-dot", ".");
    titleElement.appendChild(dot);

    header.append(kicker, titleElement);

    if (subtitle) {
      header.appendChild(
        make("p", "texts-subtitle", subtitle)
      );
    }

    return header;
  }

  try {
    const response = await fetch("data/texts.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Texts data not found");
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Texts data must be an array");
    }

    const items = data.filter(item => item && item.id);

    if (!id) {
      // Texts 목록
      root.appendChild(
        heading(
          "Texts",
          "Artist statements / Critical essays / Reviews / Interviews"
        )
      );

      root.appendChild(languageSwitch());

      const list = make("div", "texts-list");

      const getOrder = item => {
        if (item.order === "" ||
            item.order === null ||
            item.order === undefined) {
          return Infinity;
        }
        const number = Number(item.order);
        return Number.isFinite(number) ? number : Infinity;
      };

      items.sort((a, b) =>
        getOrder(a) - getOrder(b) ||
        Number(b.year || 0) - Number(a.year || 0)
      );

      if (!items.length) {
        list.appendChild(
          make(
            "p",
            "texts-empty",
            lang === "en"
              ? "No texts have been published yet."
              : "등록된 글이 아직 없습니다."
          )
        );
      }

      items.forEach(item => {
        const link = make("a", "texts-entry");
        link.href =
          "texts.html?id=" +
          encodeURIComponent(item.id) +
          "&lang=" + lang;

        const content = make("div", "texts-entry-content");

        content.appendChild(
          make(
            "span",
            "texts-category",
            categoryName(item)
          )
        );

        content.appendChild(
          make("h2", "texts-entry-title", translated(item, "title"))
        );

        const meta = [
          translated(item, "author"),
          item.year,
          item.source
        ].filter(Boolean).join(" · ");

        content.appendChild(
          make("p", "texts-meta", meta)
        );

        link.appendChild(content);
        link.appendChild(
          make("span", "texts-arrow", "↗")
        );

        list.appendChild(link);
      });

      root.appendChild(list);

    } else {
      // 글 상세 페이지
      const item = items.find(
        entry => String(entry.id) === id
      );

      if (!item) {
        root.appendChild(
          make("p", "texts-empty", "Text not found.")
        );
        return;
      }

      const back = make(
        "a",
        "texts-back",
        "← Texts"
      );
      back.href = "texts.html?lang=" + lang;
      root.appendChild(back);

      root.appendChild(languageSwitch());

      const article = make("article", "texts-article");

      article.appendChild(
        make("p", "texts-category", categoryName(item))
      );

      article.appendChild(
        make("h1", "texts-article-title", translated(item, "title"))
      );

      const meta = [
        translated(item, "author"),
        item.year,
        item.source
      ].filter(Boolean).join(" · ");

      article.appendChild(
        make("p", "texts-article-meta", meta)
      );

      const body = make("div", "texts-body");

      const translatedBody = String(
        item["body_" + lang] || ""
      ).trim();

      const fallbackBody = String(
        item.body_ko || item.body_en || ""
      ).trim();

      if (lang === "en" && !translatedBody && fallbackBody) {
        body.appendChild(
          make(
            "p",
            "texts-notice",
            "English translation is not yet available."
          )
        );
      }

      const text = translatedBody || fallbackBody;

      if (text) {
        text.split(/\n\s*\n/).forEach(paragraph => {
          const content = paragraph.trim();
          if (!content) return;

          body.appendChild(
            make("p", "texts-paragraph", content)
          );
        });
      } else {
        body.appendChild(
          make("p", "texts-empty", "본문 준비 중")
        );
      }

      article.appendChild(body);
      root.appendChild(article);

      document.title =
        translated(item, "title") + " — DOYEUN KIM";
    }

  } catch (error) {
    console.error("Texts CMS error:", error);
    root.appendChild(
      make(
        "p",
        "texts-empty",
        "글을 불러오지 못했습니다. 데이터와 서버 연결을 확인해 주세요."
      )
    );
  }
})();
