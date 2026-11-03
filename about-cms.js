
(async function () {
  const container = document.querySelector(".about-copy");
  if (!container) return;

  try {
    const response = await fetch("data/about.json", {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("About data not found");

    const data = await response.json();
    const isEnglish = document.documentElement.lang === "en";

    // 한국어 / 영어 작가노트
    const statement = (
      isEnglish ? data.statement_en : data.statement_ko
    )?.trim();

    if (statement) {
      const oldParagraphs = Array.from(container.children)
        .filter(el => el.matches("p:not(.draft-note)"));

      const anchor = oldParagraphs[0] ||
        container.querySelector(".cv-block");

      const fragment = document.createDocumentFragment();

      statement.split(/\n\s*\n/).forEach(text => {
        const p = document.createElement("p");
        p.textContent = text.trim();
        p.style.whiteSpace = "pre-line";
        fragment.appendChild(p);
      });

      container.insertBefore(fragment, anchor || null);
      oldParagraphs.forEach(el => el.remove());
      container.querySelector(".draft-note")?.remove();
    }

    // 한국어 / 영어 CV
    if (Array.isArray(data.cv_sections) &&
        data.cv_sections.length > 0) {

      const oldBlocks = Array.from(
        container.querySelectorAll(":scope > .cv-block")
      );

      const fragment = document.createDocumentFragment();

      data.cv_sections.forEach(section => {
        const block = document.createElement("div");
        block.className = "cv-block";

        const heading = document.createElement("h2");
        heading.textContent = isEnglish
          ? section.title_en
          : section.title_ko;
        block.appendChild(heading);

        (section.entries || []).forEach(entry => {
          const row = document.createElement("div");
          row.className = "cv-line";

          const year = document.createElement("span");
          year.textContent = entry.year || "";

          const description = document.createElement("span");
          description.textContent = isEnglish
            ? entry.description_en || ""
            : entry.description_ko || "";

          row.append(year, description);
          block.appendChild(row);
        });

        fragment.appendChild(block);
      });

      container.insertBefore(fragment, oldBlocks[0] || null);
      oldBlocks.forEach(el => el.remove());
    }

  } catch (error) {
    console.error("About CMS loading error:", error);
  }
})();
