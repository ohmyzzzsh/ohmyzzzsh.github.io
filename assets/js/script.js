'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
}



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
if (modalCloseBtn && overlay) {
  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  overlay.addEventListener("click", testimonialsModalFunc);
}



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () { elementToggleFunc(this); });
}

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// The page only uses a small Markdown subset, so rendering it locally avoids a
// third-party CDN dependency (which was the main cause of blank content).
const renderInlineMarkdown = (source) => source
  .replace(/\[([\s\S]*?)\]\((https?:\/\/[^\s)]+(?:\([^)]*\)[^\s)]*)?|#[A-Za-z][\w:.-]*)\)/g,
    (_match, label, href) => href.startsWith('#')
      ? `<a href="${href}">${label}</a>`
      : `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`)
  .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>')
  .replace(/ {2,}\n/g, '<br>\n');

const renderMarkdown = (source) => {
  const blocks = source.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);

  return blocks.map((block) => {
    if (/^<!--/.test(block)) return block;
    if (/^<table[\s>]/i.test(block)) return renderInlineMarkdown(block);

    const heading = block.match(/^(#{1,6})\s+([\s\S]+)$/);
    if (heading) {
      const level = heading[1].length;
      return `<h${level}>${renderInlineMarkdown(heading[2].trim())}</h${level}>`;
    }

    const lines = block.split('\n');
    if (lines.every((line) => /^[-*+]\s+/.test(line))) {
      const items = lines
        .map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*+]\s+/, ''))}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }

    return `<p>${renderInlineMarkdown(block)}</p>`;
  }).join('\n');
};

const renderEducation = (source) => {
  const entries = source.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  const items = entries.map((entry) => {
    const [heading = '', dates = '', ...degreeLines] = entry.split('\n');
    const school = heading.replace(/^###\s+/, '').trim();
    const degree = degreeLines.join(' ').trim();

    return `<li class="timeline-item">
      <h4 class="h4 timeline-item-title">${renderInlineMarkdown(school)}</h4>
      ${dates ? `<span class="timeline-date">${renderInlineMarkdown(dates.trim())}</span>` : ''}
      <p class="timeline-text">${renderInlineMarkdown(degree)}</p>
    </li>`;
  }).join('');

  return `<ol class="timeline-list">${items}</ol>`;
};

const markdownSections = ["about", "news", "publications", "education", "awards", "projects", "cve"];
const markdownFiles = { projects: "project" };

markdownSections.forEach((section) => {
  const container = document.getElementById(`${section}-container`);
  if (!container) return;
  const contentFile = markdownFiles[section] || section;

  try {
    const source = window.MARKDOWN_CONTENT?.[contentFile];
    if (typeof source !== "string") {
      throw new Error(`Missing static content for ${contentFile}.md`);
    }

    container.innerHTML = section === "education"
      ? renderEducation(source)
      : renderMarkdown(source);
  } catch (error) {
    container.innerHTML = '<p class="markdown-error">Content failed to load.</p>';
    console.error(`Unable to render ${contentFile}.md:`, error);
  }
});

const lastUpdated = document.getElementById("last-updated");
if (lastUpdated && window.CONTENT_LAST_UPDATED) {
  lastUpdated.dateTime = window.CONTENT_LAST_UPDATED;
  const [year, month, day] = window.CONTENT_LAST_UPDATED.split('-').map(Number);
  lastUpdated.textContent = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)));
}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}
