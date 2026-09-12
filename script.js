
/* ========================================
   若狭日報 - トップページ
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const newsList = document.getElementById("news-list");
  const featuredNews = document.getElementById("featured-news");
  const featuredSection = document.getElementById("featured-section");
  const categoryList = document.getElementById("category-list");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const pageTitle = document.getElementById("page-title");
  const pageDescription = document.getElementById("page-description");
  const breadcrumb = document.getElementById("breadcrumb-current");
  const resultCount = document.getElementById("result-count");
  const pagination = document.getElementById("pagination");
  const today = document.getElementById("today");
  const headingDate = document.getElementById("heading-date");

  if (!newsList || !featuredNews || !categoryList) return;

  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category") || "";
  const searchKeyword = params.get("q") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const ITEMS_PER_PAGE = 5;

  const categoryNames = [
    "県内ニュース",
    "速報",
    "地域の話題",
    "行政",
    "暮らし",
    "イベント"
  ];

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatShortDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  }

  function getSortedNews() {
    return [...newsData].sort((a, b) => b.date.localeCompare(a.date));
  }

  function renderImage(image, className = "image-placeholder") {
    if (image && /^https?:\/\//i.test(image)) {
      return `<img src="${escapeHTML(image)}" alt="" loading="lazy">`;
    }

    if (image && /^[^/\\]+(?:\/[^/\\]+)*\.(?:jpg|jpeg|png|webp|gif)$/i.test(image)) {
      return `<img src="${escapeHTML(image)}" alt="" loading="lazy">`;
    }

    return `<div class="${className}"><i class="fa-solid fa-newspaper"></i></div>`;
  }

  function getFilteredNews() {
    return getSortedNews().filter(article => {

      const categoryMatch =
        !selectedCategory || article.category === selectedCategory;

      const query = searchKeyword.trim().toLowerCase();

      const searchMatch =
        !query ||
        `${article.title} ${article.summary} ${article.body} ${article.area}`
          .toLowerCase()
          .includes(query);

      return categoryMatch && searchMatch;
    });
  }

  function renderFeatured(items) {
    if (selectedCategory || searchKeyword || !items.length) {
      featuredSection.classList.add("hidden");
      return;
    }

    const article = items[0];

    featuredSection.classList.remove("hidden");

    featuredNews.innerHTML = `
      <a href="article.html?id=${article.id}" class="featured-card">
        <div class="featured-image">
          ${renderImage(article.image)}
        </div>
        <div class="featured-body">
          <div class="news-meta">
            <span class="category">${escapeHTML(article.category)}</span>
            <span>${escapeHTML(article.area)}</span>
            <span>${formatDate(article.date)}</span>
          </div>
          <h2>${escapeHTML(article.title)}</h2>
          <p>${escapeHTML(article.summary)}</p>
          <span class="read-more">記事を読む <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </a>
    `;
  }

  function renderNewsList(items) {
    if (!items.length) {
      newsList.innerHTML = `
        <div class="no-news">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>該当するニュースはありません。</p>
        </div>
      `;
      return;
    }

    newsList.innerHTML = items.map(article => `
      <article class="news-item">
        <a href="article.html?id=${article.id}" class="news-item-image">
          ${renderImage(article.image)}
        </a>

        <div class="news-item-body">
          <div class="news-meta">
            <span class="category">${escapeHTML(article.category)}</span>
            <span>${escapeHTML(article.area)}</span>
            <span>${formatDate(article.date)}</span>
          </div>

          <h3>
            <a href="article.html?id=${article.id}">
              ${escapeHTML(article.title)}
            </a>
          </h3>

          <p>${escapeHTML(article.summary)}</p>
        </div>
      </article>
    `).join("");
  }

  function renderCategories() {
    categoryList.innerHTML = categoryNames.map(category => {

      const count = newsData.filter(
        article => article.category === category
      ).length;

      return `
        <li>
          <a href="index.html?category=${encodeURIComponent(category)}">
            <span>${escapeHTML(category)}</span>
            <span class="count">${count}件</span>
          </a>
        </li>
      `;

    }).join("");
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    const links = [];

    for (let i = 1; i <= totalPages; i++) {
      const query = new URLSearchParams();

      if (selectedCategory) query.set("category", selectedCategory);
      if (searchKeyword) query.set("q", searchKeyword);
      query.set("page", i);

      links.push(`
        <a href="index.html?${query.toString()}"
           class="${i === page ? "active" : ""}"
           aria-label="ページ${i}"
           ${i === page ? 'aria-current="page"' : ""}>
          ${i}
        </a>
      `);
    }

    pagination.innerHTML = links.join("");
  }

  function updatePageText(totalItems) {
    if (selectedCategory) {
      pageTitle.textContent = selectedCategory;
      pageDescription.textContent = "若狭県内のニュース";
      breadcrumb.textContent = selectedCategory;
    } else if (searchKeyword) {
      pageTitle.textContent = "ニュース検索";
      pageDescription.textContent = `「${searchKeyword}」の検索結果`;
      breadcrumb.textContent = "検索結果";
    } else {
      pageTitle.textContent = "若狭県内のニュース";
      pageDescription.textContent = "地域の出来事を、身近に。";
      breadcrumb.textContent = "トップ";
    }

    resultCount.textContent = `${totalItems}件`;

    const now = new Date();
    const dateText = now.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    today.textContent = dateText;
    headingDate.textContent = dateText;
  }

  function render() {
    const filtered = getFilteredNews();

    const featuredItems =
      selectedCategory || searchKeyword
        ? filtered
        : getSortedNews();

    renderFeatured(featuredItems);

    const listItems =
      selectedCategory || searchKeyword
        ? filtered
        : filtered.slice(1);

    const totalItems = listItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const visibleItems = listItems.slice(start, start + ITEMS_PER_PAGE);

    renderNewsList(visibleItems);
    renderPagination(totalItems);
    renderCategories();
    updatePageText(totalItems);
  }

  searchForm.addEventListener("submit", event => {
    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (keyword) {
      window.location.href =
        `index.html?q=${encodeURIComponent(keyword)}`;
    } else {
      window.location.href = "index.html";
    }
  });

  searchInput.value = searchKeyword;

  render();

});