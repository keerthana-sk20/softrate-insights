import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  addCategory,
  deleteArticle,
  getAdminArticles,
  getArticles,
  getCategories,
  login,
  removeCategory,
  saveArticle,
  uploadImage
} from "./api.js";
import { categories as defaultCategories, demoArticles, estimateReadTime, formatDate } from "./data.js";

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    left: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.7 6.8-4.4m-6.8 7 6.8 4.4" /></>
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Brand({ inverse = false }) {
  return <Link className={`brand${inverse ? " brand-inverse" : ""}`} to="/" aria-label="Softrate Insights home">
    <img src="/softrate-symbol.png" alt="" />
    <span>softrate<span className="brand-dot">.</span></span>
    <small>INSIGHTS</small>
  </Link>;
}

function Header({ onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location.pathname]);
  function submit(event) {
    event.preventDefault();
    onSearch(search.trim());
    setSearchOpen(false);
    setSearch("");
  }
  return <header className="site-header">
    <div className="header-inner">
      <Brand />
      <button className="mobile-menu icon-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} /></button>
      <nav className={`main-nav${menuOpen ? " nav-open" : ""}`} aria-label="Main navigation">
        <Link to="/">Home</Link>
        <Link to="/blog">All stories</Link>
        <a href="/blog?category=Software%20Development">Software</a>
        <a href="/blog?category=Artificial%20Intelligence%20%26%20Machine%20Learning">AI &amp; innovation</a>
      </nav>
      <div className="header-actions">
        {searchOpen ? <form className="header-search" onSubmit={submit}>
          <input autoFocus aria-label="Search stories" placeholder="Search stories..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <button type="submit" className="icon-button" aria-label="Submit search"><Icon name="search" /></button>
        </form> : <button className="icon-button search-trigger" aria-label="Open search" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>}
        <Link className="header-cta" to="/blog">Explore stories <Icon name="arrow" size={16} /></Link>
      </div>
    </div>
  </header>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><Brand inverse /><p>Ideas, insights, and practical perspectives on the technology shaping what comes next.</p></div>
      <div className="footer-column"><span className="footer-label">EXPLORE</span><Link to="/blog">All stories</Link><a href="/blog?category=Software%20Development">Software development</a><a href="/blog?category=Cloud%20Computing">Cloud computing</a></div>
      <div className="footer-column"><span className="footer-label">SOFTRATE</span><a href="https://softrate.com" target="_blank" rel="noreferrer">Company website <Icon name="arrow" size={14} /></a><a href="mailto:hello@softrate.com">Get in touch</a><Link to="/admin">Editorial sign in</Link></div>
      <div className="footer-note"><span className="footer-label">A NOTE FROM US</span><p>Curious minds make a better future. Thanks for reading along.</p><span className="footer-spark">↗</span></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Softrate. All rights reserved.</span><span>Made for people building what's next.</span></div>
  </footer>;
}

function useStoryData() {
  const [stories, setStories] = useState(demoArticles);
  const [categoriesList, setCategoriesList] = useState(defaultCategories.slice(1));
  useEffect(() => {
    let active = true;
    Promise.all([getArticles("?limit=100"), getCategories()])
      .then(([articleResult, categoryResult]) => {
        if (!active) return;
        const published = Array.isArray(articleResult) ? articleResult : articleResult.articles;
        if (Array.isArray(published)) setStories(published);
        if (Array.isArray(categoryResult) && categoryResult.length) setCategoriesList(categoryResult.map((item) => typeof item === "string" ? item : item.name));
      })
      .catch((error) => {
        if (active) console.error("Could not load live stories:", error);
      });
    return () => { active = false; };
  }, []);
  return { stories, categoriesList };
}

function ArticleCard({ article, compact = false }) {
  return <article className={`article-card${compact ? " article-card-compact" : ""}`}>
    <Link className="article-image-wrap" to={`/blog/${article.slug}`}>
      <img className="article-image" src={article.image || article.featuredImage} alt="" loading="lazy" />
      <span className="image-arrow"><Icon name="arrow" /></span>
    </Link>
    <div className="article-card-copy">
      <div className="article-meta"><Link to={`/blog?category=${encodeURIComponent(article.category)}`}>{article.category}</Link><span className="meta-dot" />{formatDate(article.publishedAt)}</div>
      <h3><Link to={`/blog/${article.slug}`}>{article.title}</Link></h3>
      {!compact && <p>{article.excerpt}</p>}
      {!compact && <div className="card-byline">{article.author} <span>·</span> <Icon name="clock" size={14} /> {article.readTime || estimateReadTime(article.content)} min read</div>}
    </div>
  </article>;
}

function SectionHeading({ eyebrow, title, action, to = "/blog" }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <Link className="text-link" to={to}>{action}<Icon name="arrow" size={16} /></Link>}</div>;
}

function remarkVideoEmbeds() {
  return (tree) => {
    function visit(node) {
      if (node.type === "paragraph" && node.children?.length === 1 && node.children[0].type === "link") {
        const url = node.children[0].url;
        const youtubeId = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&].*)?$/)?.[1];
        const vimeoId = url.match(/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:[?&].*)?$/)?.[1];
        if (youtubeId || vimeoId) {
          node.type = "video";
          node.data = {
            hName: "iframe",
            hProperties: {
              src: youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : `https://player.vimeo.com/video/${vimeoId}`,
              title: node.children[0].children?.map((child) => child.value || "").join("") || "Embedded video",
              loading: "lazy",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
              referrerPolicy: "strict-origin-when-cross-origin",
              allowFullScreen: true
            }
          };
          node.children = [];
          return;
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

function HomePage({ stories, categoriesList }) {
  const featured = stories.find((story) => story.featured) || stories[0];
  const latest = stories.filter((story) => story._id !== featured?._id).slice(0, 3);
  const trending = stories.slice(3, 6);
  return <main>
    <section className="hero-section page-shell">
      <div className="hero-copy">
        <div className="hero-overline"><span className="eyebrow">THE SOFTRATE JOURNAL</span><span className="overline-line" /></div>
        <h1>Ideas for<br /><em>what’s next.</em></h1>
        <p>Fresh perspectives on technology, people, and the ideas shaping a better digital future.</p>
        <Link to="/blog" className="button button-dark">Explore all stories <Icon name="arrow" size={16} /></Link>
        <div className="hero-aside"><span className="aside-line" />Thoughtful reads for curious minds.</div>
      </div>
      {featured && <Link to={`/blog/${featured.slug}`} className="hero-feature">
        <img src={featured.image || featured.featuredImage} alt="" />
        <div className="hero-feature-overlay" />
        <div className="feature-label"><span className="feature-pulse" /> EDITOR’S PICK</div>
        <div className="hero-feature-copy"><div className="article-meta light-meta"><span>{featured.category}</span><span className="meta-dot" />{formatDate(featured.publishedAt)}</div><h2>{featured.title}</h2><span className="feature-read">Read the story <Icon name="arrow" size={15} /></span></div>
        <span className="feature-index">01 <span>/ 07</span></span>
      </Link>}
    </section>

    <section className="category-band">
      <div className="category-inner page-shell"><span className="eyebrow">EXPLORE BY TOPIC</span><div className="category-links">
        {categoriesList.slice(0, 6).map((category, index) => <Link key={category} to={`/blog?category=${encodeURIComponent(category)}`}><span>0{index + 1}</span>{category}<Icon name="arrow" size={14} /></Link>)}
      </div></div>
    </section>

    <section className="page-shell latest-section">
      <SectionHeading eyebrow="THE LATEST" title="A little something to think about." action="View all stories" />
      <div className="latest-grid">{latest.map((article) => <ArticleCard key={article._id} article={article} />)}</div>
    </section>

    <section className="quote-band"><div className="page-shell quote-inner"><span className="quote-mark">“</span><blockquote>Technology is at its best when it brings us closer to what matters.</blockquote><span className="quote-byline">A belief we build by.</span><div className="quote-orbit orbit-one" /><div className="quote-orbit orbit-two" /></div></section>

    <section className="page-shell trending-section">
      <SectionHeading eyebrow="WORTH YOUR TIME" title="Stories making the rounds." action="See what’s new" />
      <div className="trending-grid">{trending.map((article, index) => <div className="trending-item" key={article._id}><span className="trend-number">0{index + 1}</span><ArticleCard article={article} compact /></div>)}</div>
    </section>

    <section className="newsletter-band"><div className="page-shell newsletter-inner"><div><span className="eyebrow">A GOOD READ, NOW AND THEN</span><h2>Ideas worth <em>opening.</em></h2><p>Thoughtful perspectives from Softrate, delivered when we have something to say.</p></div><a className="button button-light" href="mailto:hello@softrate.com?subject=Keep%20me%20in%20the%20loop">Keep me in the loop <Icon name="arrow" size={16} /></a><span className="newsletter-stamp">S<span>.</span></span></div></section>
  </main>;
}

function BlogPage({ stories, categoriesList }) {
  const [params, setParams] = useSearchParams();
  const selectedCategory = params.get("category") || "All stories";
  const search = params.get("search") || "";
  const [visibleCount, setVisibleCount] = useState(6);
  const filtered = useMemo(() => stories.filter((story) => {
    const categoryMatch = selectedCategory === "All stories" || story.category === selectedCategory;
    const term = search.toLowerCase();
    const searchMatch = !term || `${story.title} ${story.excerpt} ${story.category} ${story.author} ${(story.tags || []).join(" ")}`.toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  }), [stories, selectedCategory, search]);
  useEffect(() => setVisibleCount(6), [selectedCategory, search]);
  return <main className="page-shell blog-page">
    <div className="blog-intro"><span className="eyebrow">THE SOFTRATE JOURNAL</span><h1>Good ideas.<br /><em>Shared freely.</em></h1><p>Perspectives, practices, and a little curiosity from the people building what’s next.</p></div>
    <div className="blog-controls">
      <div className="filter-tabs" aria-label="Filter by category">
        {["All stories", ...categoriesList].map((category) => <button key={category} className={selectedCategory === category ? "filter-active" : ""} onClick={() => setParams(category === "All stories" ? {} : { category, ...(search ? { search } : {}) })}>{category}</button>)}
      </div>
      <label className="listing-search"><Icon name="search" /><input value={search} onChange={(event) => setParams({ ...(selectedCategory !== "All stories" ? { category: selectedCategory } : {}), ...(event.target.value ? { search: event.target.value } : {}) })} placeholder="Find a story" aria-label="Search stories" /></label>
    </div>
    <div className="listing-summary"><span>{search ? `Results for “${search}”` : selectedCategory}</span><span>{filtered.length} {filtered.length === 1 ? "story" : "stories"}</span></div>
    {filtered.length ? <div className="listing-grid">{filtered.slice(0, visibleCount).map((article) => <ArticleCard key={article._id} article={article} />)}</div> : <div className="empty-state"><span className="eyebrow">NOTHING HERE JUST YET</span><h2>No stories found.</h2><p>Try a different search or explore another topic.</p><button className="button button-dark" onClick={() => setParams({})}>See all stories <Icon name="arrow" size={16} /></button></div>}
    {filtered.length > visibleCount && <div className="load-more"><button className="button button-outline" onClick={() => setVisibleCount((count) => count + 6)}>Load more stories <Icon name="plus" size={16} /></button></div>}
  </main>;
}

function ArticlePage({ stories }) {
  const { slug } = useParams();
  const article = stories.find((story) => story.slug === slug);
  const sorted = [...stories].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const articleIndex = sorted.findIndex((story) => story.slug === slug);
  const headings = useMemo(() => (article?.content || "").split("\n").filter((line) => /^#{2,3}\s/.test(line)).map((line) => {
    const text = line.replace(/^#{2,3}\s/, "").trim();
    return { text, id: text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") };
  }), [article]);
  useEffect(() => {
    if (!article) return;
    document.title = `${article.seoTitle || article.title} | Softrate Insights`;
    const description = article.seoDescription || article.excerpt;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
    meta.content = description;
    document.querySelectorAll("meta[data-article-meta], link[data-article-meta], script[data-article-schema]").forEach((tag) => tag.remove());
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.dataset.articleSchema = "true";
    schema.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description, image: article.image || article.featuredImage, datePublished: article.publishedAt, author: { "@type": "Person", name: article.author } });
    document.head.appendChild(schema);
    const metadata = [
      ["property", "og:type", "article"],
      ["property", "og:title", article.seoTitle || article.title],
      ["property", "og:description", description],
      ["property", "og:image", article.image || article.featuredImage || ""],
      ["property", "og:url", window.location.href],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", article.seoTitle || article.title],
      ["name", "twitter:description", description]
    ].map(([attribute, key, value]) => {
      const metaTag = document.createElement("meta");
      metaTag.setAttribute(attribute, key);
      metaTag.content = value;
      metaTag.dataset.articleMeta = "true";
      document.head.appendChild(metaTag);
      return metaTag;
    });
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = window.location.href;
    canonical.dataset.articleMeta = "true";
    document.head.appendChild(canonical);
    return () => {
      document.title = "Softrate Insights — Ideas for what's next";
      schema.remove();
      metadata.forEach((metaTag) => metaTag.remove());
      canonical.remove();
    };
  }, [article]);
  if (!article) return <main className="page-shell not-found"><span className="eyebrow">404 / STORY NOT FOUND</span><h1>This page took<br /><em>a different turn.</em></h1><Link className="button button-dark" to="/blog"><Icon name="left" size={16} /> Back to stories</Link></main>;
  const related = stories.filter((story) => story.slug !== article.slug && story.category === article.category).slice(0, 2);
  const previous = sorted[articleIndex + 1];
  const next = sorted[articleIndex - 1];
  async function share() {
    if (navigator.share) await navigator.share({ title: article.title, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
  }
  return <main className="article-page">
    <div className="article-top page-shell"><Link className="back-link" to="/blog"><Icon name="left" size={15} /> All stories</Link><span className="eyebrow">{article.category}</span></div>
    <header className="article-header page-shell"><h1>{article.title}</h1><p className="article-deck">{article.excerpt}</p><div className="article-author-row"><div className="author-avatar">{(article.author || "S").split(" ").map((word) => word[0]).slice(0, 2).join("")}</div><div><strong>{article.author}</strong><span>{formatDate(article.publishedAt)} <span className="meta-dot" /> {article.readTime || estimateReadTime(article.content)} min read</span></div><button className="share-button" onClick={share}><Icon name="share" size={16} /> Share</button></div></header>
    <div className="article-cover"><img src={article.image || article.featuredImage} alt="" /></div>
    <div className="article-body-layout page-shell">
      {headings.length > 2 && <aside className="table-of-contents"><span className="eyebrow">IN THIS STORY</span>{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.text}</a>)}</aside>}
      <article className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm, remarkVideoEmbeds]} components={{
        h2: ({ children, ...props }) => { const text = String(children); const id = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-"); return <h2 id={id} {...props}>{children}</h2>; },
        a: ({ href, children, ...props }) => <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noreferrer" : undefined} {...props}>{children}</a>,
        img: ({ src, alt, ...props }) => <img src={src} alt={alt || ""} loading="lazy" {...props} />,
        iframe: ({ src, title, ...props }) => {
          const safeSource = /^https:\/\/(?:www\.youtube-nocookie\.com|player\.vimeo\.com)\//.test(src || "");
          return safeSource ? <div className="video-frame"><iframe src={src} title={title || "Embedded video"} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" {...props} /></div> : null;
        }
      }}>{article.content || ""}</ReactMarkdown></article>
    </div>
    <div className="article-end page-shell"><span>Enjoyed this perspective?</span><button className="text-link" onClick={share}>Share it with someone <Icon name="arrow" size={16} /></button></div>
    {(previous || next) && <nav className="article-pagination page-shell" aria-label="Article navigation">
      {previous ? <Link to={`/blog/${previous.slug}`}><span><Icon name="left" size={14} /> PREVIOUS STORY</span><strong>{previous.title}</strong></Link> : <span />}
      {next ? <Link className="next-story" to={`/blog/${next.slug}`}><span>NEXT STORY <Icon name="arrow" size={14} /></span><strong>{next.title}</strong></Link> : <span />}
    </nav>}
    {related.length > 0 && <section className="related-section page-shell"><SectionHeading eyebrow="KEEP EXPLORING" title="A few more for you." /><div className="latest-grid">{related.map((story) => <ArticleCard key={story._id} article={story} />)}</div></section>}
  </main>;
}

const emptyArticle = { title: "", slug: "", excerpt: "", content: "", author: "", category: defaultCategories[1], tagsText: "", image: "", seoTitle: "", seoDescription: "", status: "draft", featured: false, scheduledAt: "" };

function AdminPage({ stories, categoriesList }) {
  const [token, setToken] = useState(localStorage.getItem("softrate-admin-token"));
  const [adminStories, setAdminStories] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyArticle);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [newCategory, setNewCategory] = useState("");
  const [managedCategories, setManagedCategories] = useState(categoriesList);
  const [tab, setTab] = useState("posts");
  const contentRef = useRef(null);
  const navigate = useNavigate();

  async function refresh() {
    const result = await getAdminArticles();
    setAdminStories(result.articles || []);
    const categoryResult = await getCategories();
    if (Array.isArray(categoryResult)) setManagedCategories(categoryResult.map((item) => typeof item === "string" ? item : item.name));
  }
  useEffect(() => {
    if (!token) return;
    refresh().catch((err) => { setError(err.message); if (err.message.toLowerCase().includes("token")) signOut(); });
  }, [token]);
  function signOut() { localStorage.removeItem("softrate-admin-token"); setToken(null); }
  async function submitLogin(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await login(credentials); localStorage.setItem("softrate-admin-token", result.token); setToken(result.token); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function startNew() { setEditing(null); setForm({ ...emptyArticle, category: managedCategories[0] || defaultCategories[1] }); setTab("posts"); setError(""); }
  function startEdit(article) {
    setEditing(article._id);
    setForm({ ...emptyArticle, ...article, tagsText: (article.tags || []).join(", "), scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : "" });
    setTab("editor"); setError("");
  }
  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value, ...(name === "title" && !editing && !current.slug ? { slug: value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") } : {}) }));
  }
  async function submitArticle(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const payload = { ...form, tags: form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean), scheduledAt: form.scheduledAt || null };
      delete payload.tagsText;
      await saveArticle(payload, editing);
      setNotice(editing ? "Story updated." : "Story saved.");
      setEditing(null); setForm(emptyArticle); setTab("posts"); await refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function removePost(article) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    setError("");
    try { await deleteArticle(article._id); setNotice("Story deleted."); await refresh(); }
    catch (err) { setError(err.message); }
  }
  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    try { const result = await uploadImage(file); setForm((current) => ({ ...current, image: result.url })); setNotice("Image uploaded."); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); event.target.value = ""; }
  }
  async function handleInlineUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    try {
      const result = await uploadImage(file);
      const editor = contentRef.current;
      const currentContent = editor?.value ?? form.content;
      const start = editor?.selectionStart ?? currentContent.length;
      const end = editor?.selectionEnd ?? start;
      const imageMarkdown = `\n\n![Describe this image](${result.url})\n\n`;
      setForm((current) => ({ ...current, content: `${currentContent.slice(0, start)}${imageMarkdown}${currentContent.slice(end)}` }));
      requestAnimationFrame(() => {
        editor?.focus();
        editor?.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
      });
      setNotice("In-story image uploaded and added to your draft.");
    } catch (err) { setError(err.message); }
    finally { setBusy(false); event.target.value = ""; }
  }
  async function createCategory(event) {
    event.preventDefault(); setError("");
    try { const result = await addCategory(newCategory); setManagedCategories((current) => [...current, result.name]); setNewCategory(""); setNotice("Category added."); }
    catch (err) { setError(err.message); }
  }
  async function deleteCategory(category) {
    if (!window.confirm(`Remove “${category}” from categories? Existing stories will keep this category.`)) return;
    try { await removeCategory(category); setManagedCategories((current) => current.filter((name) => name !== category)); setNotice("Category removed."); }
    catch (err) { setError(err.message); }
  }

  if (!token) return <main className="admin-login-page"><div className="admin-login-card"><Brand /><span className="eyebrow">SOFTRATE EDITORIAL</span><h1>Your ideas,<br /><em>your space.</em></h1><p>Sign in to manage stories and keep the journal moving.</p><form onSubmit={submitLogin} className="admin-form"><label>Email<input type="email" autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>{error && <div className="form-error">{error}</div>}<button className="button button-dark" disabled={busy}>{busy ? "Signing in..." : "Sign in"} <Icon name="arrow" size={16} /></button></form><Link className="back-link login-back" to="/"><Icon name="left" size={15} /> Back to the journal</Link></div></main>;

  return <main className="admin-page">
    <header className="admin-header"><Brand /><div><span className="admin-welcome">EDITORIAL STUDIO</span><button className="admin-logout" onClick={signOut}><Icon name="logout" size={16} /> Sign out</button></div></header>
    <div className="admin-content">
      <div className="admin-title-row"><div><span className="eyebrow">SOFTRATE INSIGHTS</span><h1>Editorial studio<span>.</span></h1><p>A good place to get a good idea out into the world.</p></div><button className="button button-dark" onClick={startNew}><Icon name="plus" size={16} /> New story</button></div>
      {error && <div className="admin-alert">{error}</div>}{notice && <div className="admin-notice">{notice}</div>}
      <div className="admin-stats"><div><span>ALL STORIES</span><strong>{adminStories.length}</strong></div><div><span>PUBLISHED</span><strong>{adminStories.filter((story) => story.status === "published").length}</strong></div><div><span>DRAFTS</span><strong>{adminStories.filter((story) => story.status === "draft").length}</strong></div><div><span>TOPICS</span><strong>{managedCategories.length}</strong></div></div>
      <div className="admin-tabs"><button className={tab === "posts" ? "admin-tab-active" : ""} onClick={() => setTab("posts")}>Stories</button><button className={tab === "categories" ? "admin-tab-active" : ""} onClick={() => setTab("categories")}>Categories</button>{tab === "editor" && <button className="admin-tab-active">Story editor</button>}</div>
      {tab === "posts" && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>STORY</th><th>TOPIC</th><th>STATUS</th><th>UPDATED</th><th /></tr></thead><tbody>{adminStories.map((story) => <tr key={story._id}><td><strong>{story.title}</strong><span>by {story.author || "Softrate Editorial"}</span></td><td>{story.category}</td><td><span className={`status-pill status-${story.status}`}>{story.status}</span></td><td>{formatDate(story.updatedAt || story.publishedAt)}</td><td><button className="table-action" aria-label={`Edit ${story.title}`} onClick={() => startEdit(story)}><Icon name="edit" size={16} /></button><button className="table-action danger-action" aria-label={`Delete ${story.title}`} onClick={() => removePost(story)}><Icon name="trash" size={16} /></button></td></tr>)}</tbody></table>{!adminStories.length && <div className="admin-empty">Your first story is waiting to be written.</div>}</div>}
      {tab === "categories" && <div className="category-manager"><div><span className="eyebrow">KEEP YOUR TOPICS TIDY</span><h2>Categories</h2><p>Make it easy for readers to find the stories they care about.</p></div><form className="category-add-form" onSubmit={createCategory}><input required value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. Product Design" /><button className="button button-dark" type="submit"><Icon name="plus" size={16} /> Add topic</button></form><div className="managed-categories">{managedCategories.map((category) => <div key={category}>{category}<button onClick={() => deleteCategory(category)} aria-label={`Remove ${category}`}><Icon name="close" size={16} /></button></div>)}</div></div>}
      {tab === "editor" && <form className="story-editor" onSubmit={submitArticle}>
        <div className="editor-main">
          <label>Story title<input name="title" required value={form.title} onChange={updateField} placeholder="A thoughtful title goes here" /></label>
          <label>Short description<textarea name="excerpt" rows="2" required maxLength="240" value={form.excerpt} onChange={updateField} placeholder="A short introduction for the listing page" /></label>
          <label>Article content <span className="field-note">Markdown supported — headings, links, images, tables and code.</span><textarea ref={contentRef} className="content-editor" name="content" required value={form.content} onChange={updateField} placeholder={"## Start with a good idea\n\nWrite your story here..."} /></label>
          <label className="upload-label">Upload an in-story image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleInlineUpload} /><span className="upload-hint">The image Markdown is inserted at your cursor · up to 5 MB</span></label>
          <label>Featured image URL<input name="image" value={form.image} onChange={updateField} placeholder="https://..." /></label>
          <label className="upload-label">Or upload an image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleUpload} /><span className="upload-hint">JPEG, PNG, WebP or GIF · up to 5 MB</span></label>
          {form.image && <img className="editor-image-preview" src={form.image} alt="Featured image preview" />}
        </div>
        <aside className="editor-sidebar">
          <div className="editor-sidebar-title"><span className="eyebrow">STORY DETAILS</span></div>
          <label>Publication status<select name="status" value={form.status} onChange={updateField}><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option></select></label>
          {form.status === "scheduled" && <label>Publish date and time<input type="datetime-local" name="scheduledAt" required value={form.scheduledAt} onChange={updateField} /></label>}
          <label>Category<select name="category" value={form.category} onChange={updateField}>{managedCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label>Author<input name="author" required value={form.author} onChange={updateField} placeholder="Author name" /></label>
          <label>Tags <span className="field-note">Separate with commas</span><input name="tagsText" value={form.tagsText} onChange={updateField} placeholder="AI, engineering, ideas" /></label>
          <label>URL slug<input name="slug" required value={form.slug} onChange={updateField} /></label>
          <label>SEO title<input name="seoTitle" maxLength="70" value={form.seoTitle} onChange={updateField} placeholder="Optional — defaults to title" /></label>
          <label>SEO description<textarea name="seoDescription" rows="3" maxLength="160" value={form.seoDescription} onChange={updateField} placeholder="Optional — defaults to short description" /></label>
          <label className="featured-checkbox"><input type="checkbox" name="featured" checked={form.featured} onChange={updateField} /> Feature this story</label>
          {error && <div className="form-error">{error}</div>}
          <div className="editor-actions"><button type="button" className="button button-outline" onClick={() => setTab("posts")}>Cancel</button><button className="button button-dark" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Save story"} <Icon name="arrow" size={16} /></button></div>
        </aside>
      </form>}
    </div>
  </main>;
}

function PublicLayout({ onSearch }) {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return <><Header onSearch={onSearch} /><Outlet /><Footer /></>;
}

export default function App() {
  const { stories, categoriesList } = useStoryData();
  const navigate = useNavigate();
  const location = useLocation();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const searchConsoleVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
  useEffect(() => {
    if (!measurementId || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
  }, [measurementId]);
  useEffect(() => {
    if (!searchConsoleVerification || document.querySelector('meta[name="google-site-verification"]')) return;
    const meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = searchConsoleVerification;
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [searchConsoleVerification]);
  useEffect(() => {
    if (measurementId && window.gtag) {
      window.gtag("event", "page_view", { page_path: `${location.pathname}${location.search}` });
    }
  }, [location, measurementId]);
  function handleSearch(term) { navigate(term ? `/blog?search=${encodeURIComponent(term)}` : "/blog"); }
  return <Routes>
    <Route path="/admin" element={<AdminPage stories={stories} categoriesList={categoriesList} />} />
    <Route path="/" element={<PublicLayout onSearch={handleSearch} />}>
      <Route index element={<HomePage stories={stories} categoriesList={categoriesList} />} />
      <Route path="blog" element={<BlogPage stories={stories} categoriesList={categoriesList} />} />
      <Route path="blog/:slug" element={<ArticlePage stories={stories} />} />
      <Route path="*" element={<main className="page-shell not-found"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1>Let’s find<br /><em>another idea.</em></h1><Link className="button button-dark" to="/"><Icon name="left" size={16} /> Back home</Link></main>} />
    </Route>
  </Routes>;
}
