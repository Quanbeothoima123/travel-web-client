/**
 * TOC (Table of Contents) Generator Utility
 * Generates table of contents from HTML content
 * Usage: Place in /lib/utils/ or /utils/ folder
 */

const generateTOCFromHtml = (html, options = {}) => {
  const {
    headingSelector = "h1, h2, h3, h4, h5, h6",
    tocTitle = "Mục lục",
    tocClass = "toc",
    generateIds = true,
    smoothScroll = true,
    includeNumbers = false,
  } = options;

  // Check if we're in browser environment
  if (typeof window === "undefined") {
    return { tocHtml: "", contentHtml: html, headingsCount: 0, headings: [] };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const headings = Array.from(doc.querySelectorAll(headingSelector));

  if (!headings.length) {
    return { tocHtml: "", contentHtml: html, headingsCount: 0, headings: [] };
  }

  // Helper function to generate clean id from text
  const generateId = (text, index) => {
    // Remove HTML tags, normalize text
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    // Convert to slug: remove special chars, replace spaces with dash
    const slug = cleanText
      .toLowerCase()
      .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a")
      .replace(/[éèẻẽẹêếềểễệ]/g, "e")
      .replace(/[íìỉĩị]/g, "i")
      .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
      .replace(/[úùủũụưứừửữự]/g, "u")
      .replace(/[ýỳỷỹỵ]/g, "y")
      .replace(/đ/g, "d")
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with dash
      .replace(/-+/g, "-") // Replace multiple dashes
      .replace(/^-|-$/g, ""); // Remove leading/trailing dashes

    return slug || `heading-${index}`;
  };

  // Ensure each heading has an id
  if (generateIds) {
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = generateId(heading.textContent, index);
      }
    });
  }

  // Build hierarchical structure
  const buildTocHtml = () => {
    if (!headings.length) return "";

    let tocHtml = `<div class="${tocClass}">`;
    if (tocTitle) {
      tocHtml += `<div class="toc-title">${tocTitle}</div>`;
    }

    let currentLevel = parseInt(headings[0].tagName.charAt(1));
    let tocContent = '<ul class="toc-list">';
    let listStack = []; // Stack để track các level

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      const id = heading.id;

      if (level > currentLevel) {
        // Deeper level - tạo nested ul
        for (let i = currentLevel; i < level; i++) {
          tocContent += '<ul class="toc-sublist">';
          listStack.push("ul");
        }
      } else if (level < currentLevel) {
        // Shallower level - đóng các ul
        for (let i = level; i < currentLevel; i++) {
          if (listStack.length > 0) {
            tocContent += "</ul>";
            listStack.pop();
          }
        }
      }

      const numbering = includeNumbers ? `${index + 1}. ` : "";
      const smoothScrollAttr = smoothScroll ? ' data-smooth="true"' : "";

      tocContent += `
        <li class="toc-item toc-level-${level}">
          <a href="#${id}" class="toc-link"${smoothScrollAttr}>
            ${numbering}${text}
          </a>
        </li>
      `;

      currentLevel = level;
    });

    // Đóng tất cả ul còn lại
    while (listStack.length > 0) {
      tocContent += "</ul>";
      listStack.pop();
    }

    tocContent += "</ul>";
    tocHtml += tocContent + "</div>";

    return tocHtml;
  };

  const tocHtml = buildTocHtml();

  return {
    tocHtml,
    contentHtml: doc.body.innerHTML,
    headingsCount: headings.length,
    headings: headings.map((h) => ({
      level: parseInt(h.tagName.charAt(1)),
      text: h.textContent.trim(),
      id: h.id,
    })),
  };
};

export default generateTOCFromHtml;
