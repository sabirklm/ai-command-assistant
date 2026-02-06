const admin = require("firebase-admin");
const { db } = require("../src/config/firebase");

const COLLECTION = "articles";

/**
 * Generate slug
 */
const generateSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 60);

/**
 * Ensure slug is unique
 */
const ensureUniqueSlug = async (baseSlug, language = "en") => {
  let slug = baseSlug;

  for (let i = 0; i < 20; i++) {
    const snapshot = await db
      .collection(COLLECTION)
      .where("slug", "==", slug)
      .where("language", "==", language)
      .limit(1)
      .get();

    if (snapshot.empty) return slug;

    slug = `${baseSlug}-${i + 1}`;
  }

  throw new Error("Unable to generate unique slug");
};

/**
 * Add article
 */
const addArticle = async (articleData) => {
  if (!articleData.title) {
    throw new Error("Title is required");
  }

  const language = articleData.language || "en";
  const baseSlug = articleData.slug || generateSlug(articleData.title);
  const slug = await ensureUniqueSlug(baseSlug, language);

  const data = {
    title: articleData.title,
    description: articleData.description,
    image: articleData.image || null,

    source: articleData.source || "bbc",
    sourceLogo: articleData.sourceLogo || null,
    category: articleData.category || "technology",
    layoutType: articleData.layoutType || "fullImage",

    slug,
    language,

    date: admin.firestore.Timestamp.fromDate(
      new Date(articleData.date || Date.now())
    ),

    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: null,

    scrapedFrom: articleData.scrapedFrom || null,
    processedAt: admin.firestore.Timestamp.now(),
  };

  const docRef = await db.collection(COLLECTION).add(data);
  return docRef.id;
};

/**
 * Get article by slug
 */
const getArticleBySlug = async (slug, language = "en") => {
  const snapshot = await db
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .where("language", "==", language)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error("Article not found");
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    date: data.date?.toDate?.(),
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.() || null,
  };
};

module.exports = {
  addArticle,
  getArticleBySlug,
};