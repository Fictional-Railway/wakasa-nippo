
/* ========================================
   若狭日報 - 個別記事ページ
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const article = newsData.find(news => news.id === id);

  const articleTitle = document.getElementById("article-title");
  const articleMeta = document.getElementById("article-meta");
  const articleImage = document.getElementById("article-image");
  const articleSummary = document.getElementById("article-summary");
  const articleBody = document.getElementById("article-body");
  const breadcrumbTitle = document.getElementById("breadcrumb-title");
  const breadcrumbCategory = document.getElementById("breadcrumb-category");
  const categoryList = document.getElementById("category-list");
  const today = document.getElementById("today");

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

  if (today) {
    today.textContent = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  if (!article) {

    document.title = "記事が見つかりません｜若狭日報";

    articleTitle.textContent = "記事が見つかりませんでした";
    articleMeta.innerHTML = "";
    articleImage.innerHTML = "";
    articleSummary.textContent = "";
    articleBody.innerHTML = `
      <p>
        指定された記事は存在しないか、
        削除された可能性があります。
      </p>
      <p>
        <a href="index.html">トップページへ戻る</a>
      </p>
    `;

    return;
  }

  document.title = `${article.title}｜若狭日報`;

  breadcrumbTitle.textContent = article.title;
  breadcrumbCategory.textContent = article.category;
  breadcrumbCategory.href =
    `index.html?category=${encodeURIComponent(article.category)}`;

  articleMeta.innerHTML = `
    <span class="category">${escapeHTML(article.category)}</span>
    <span>${escapeHTML(article.area)}</span>
    <span>${formatDate(article.date)}</span>
  `;

  articleTitle.textContent = article.title;

  if (article.image) {
    articleImage.innerHTML = `
      <img src="${escapeHTML(article.image)}" alt="" class="article-main-image">
    `;
  } else {
    articleImage.innerHTML = "";
  }

  articleSummary.textContent = article.summary;

  articleBody.innerHTML = article.body;

  const categoryNames = [
    "県内ニュース",
    "速報",
    "地域の話題",
    "行政",
    "暮らし",
    "イベント"
  ];

  categoryList.innerHTML = categoryNames.map(category => `
    <li>
      <a href="index.html?category=${encodeURIComponent(category)}">
        <span>${escapeHTML(category)}</span>
      </a>
    </li>
  `).join("");

});