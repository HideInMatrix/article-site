import { PrismaLibSql } from "@prisma/adapter-libsql";
import prismaClientPkg from "@prisma/client";

const { PrismaClient } = prismaClientPkg;

const adapter = new PrismaLibSql({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

const articles = [
  {
    slug: "design-longform-articles-read-through",
    title: "How do you design a long-form article that people actually finish?",
    titleEn: "How do you design a long-form article that people actually finish?",
    titleZhHant: "如何設計一篇讓人願意讀完的長文？",
    excerpt: "A practical look at titles, openings, pacing, and endings that improve read-through rates.",
    excerptEn: "A practical look at titles, openings, pacing, and endings that improve read-through rates.",
    excerptZhHant: "從標題、開頭、段落節奏到結尾互動，系統性提升文章的閱讀完成率。",
    category: "写作方法",
    authorName: "David",
    readTimeMinutes: 8,
    publishedAt: new Date("2026-03-18T09:00:00.000Z"),
    tags: [
      { slug: "longform-writing", name: "longform" },
      { slug: "content-structure", name: "structure" },
      { slug: "reading-retention", name: "retention" },
    ],
    content: `The best long-form articles are not the ones with the most information. They are the ones with the best rhythm.\n\nA strong title does more than describe the topic. It gives readers a reason to continue. An effective opening should set expectations quickly, and the body should be structured in a way that keeps readers oriented instead of lost.\n\nIn practice, long-form writing works when every section feels like progress. Readers should always know why they are still reading and what they will gain by reaching the end.\n\nA conclusion should not merely summarize. It should help the reader decide what to do next — comment, save, share, or continue reading related work.`,
    contentEn: `The best long-form articles are not the ones with the most information. They are the ones with the best rhythm.\n\nA strong title does more than describe the topic. It gives readers a reason to continue. An effective opening should set expectations quickly, and the body should be structured in a way that keeps readers oriented instead of lost.\n\nIn practice, long-form writing works when every section feels like progress. Readers should always know why they are still reading and what they will gain by reaching the end.\n\nA conclusion should not merely summarize. It should help the reader decide what to do next — comment, save, share, or continue reading related work.`,
    contentZhHant: `真正讓人願意讀完的長文，不是資訊最多，而是節奏最好。\n\n好的標題不只是告訴讀者文章在寫什麼，更要提供一個繼續往下看的理由。好的開頭則應該在很短的篇幅內建立閱讀預期，讓讀者快速判斷這篇文章值不值得投入時間。\n\n長文真正有效的地方，在於每一段都像一個明確的推進點。讀者應該始終知道自己為什麼還在讀，以及讀完後會得到什麼。\n\n結尾也不應只是重複總結，而應該把下一步交還給讀者：留言、收藏、分享，或者繼續閱讀相關內容。`,
    comments: [],
    likes: ["seed-like-1", "seed-like-2", "seed-like-3"],
  },
  {
    slug: "community-cold-start-first-100-readers",
    title: "Community cold start: how do you get the first 100 readers?",
    titleEn: "Community cold start: how do you get the first 100 readers?",
    titleZhHant: "社群冷啟動：前 100 位讀者到底該怎麼來？",
    excerpt: "In the early stage, discussion quality matters more than raw acquisition volume.",
    excerptEn: "In the early stage, discussion quality matters more than raw acquisition volume.",
    excerptZhHant: "早期不要急著投放，先把內容結構、討論機制和分發路徑做通。",
    category: "社区增长",
    authorName: "David",
    readTimeMinutes: 6,
    publishedAt: new Date("2026-03-19T09:30:00.000Z"),
    tags: [
      { slug: "cold-start", name: "cold-start" },
      { slug: "community-growth", name: "community-growth" },
      { slug: "distribution", name: "distribution" },
    ],
    content: `Most content communities fail early because they optimize for acquisition volume before they optimize for discussion quality.\n\nIf your articles do not create a reason for readers to return, comment, or share, bringing in more traffic only amplifies the weakness.\n\nThe first 100 readers matter because they help you understand whether your positioning, homepage structure, and interaction design are actually working. Their behavior is more valuable than vanity metrics.\n\nIn the early phase, small but high-quality distribution usually beats broad but shallow exposure.`,
    contentEn: `Most content communities fail early because they optimize for acquisition volume before they optimize for discussion quality.\n\nIf your articles do not create a reason for readers to return, comment, or share, bringing in more traffic only amplifies the weakness.\n\nThe first 100 readers matter because they help you understand whether your positioning, homepage structure, and interaction design are actually working. Their behavior is more valuable than vanity metrics.\n\nIn the early phase, small but high-quality distribution usually beats broad but shallow exposure.`,
    contentZhHant: `大多數內容社群在冷啟動階段會做錯的第一件事，就是太早把注意力放在拉新數量上。\n\n如果文章本身沒有形成穩定的討論回路，讀者來了也只是看一眼就走。真正應該先打磨的是：定位是否清晰、首頁是否有結構感、文章頁是否有自然的互動入口。\n\n前一百位讀者的重要性，不在於規模，而在於他們提供的訊號。你需要觀察他們停在哪裡、會不會留言、會不會回訪，以及哪些內容最容易帶來第二次打開。\n\n在早期，高密度的小範圍分發，往往比看似更大的曝光更有效。`,
    comments: [],
    likes: ["seed-like-4", "seed-like-5"],
  },
  {
    slug: "when-to-show-like-actions",
    title: "When should like, save, and comment actions appear?",
    titleEn: "When should like, save, and comment actions appear?",
    titleZhHant: "點讚、收藏、留言，分別應該在什麼時機出現？",
    excerpt: "Engagement entry points work best when they feel natural, not interruptive.",
    excerptEn: "Engagement entry points work best when they feel natural, not interruptive.",
    excerptZhHant: "互動入口不是越多越好，而是要在使用者最自然的時刻出現。",
    category: "产品设计",
    authorName: "David",
    readTimeMinutes: 5,
    publishedAt: new Date("2026-03-20T01:00:00.000Z"),
    tags: [
      { slug: "product-design", name: "product-design" },
      { slug: "interaction-design", name: "interaction-design" },
      { slug: "engagement", name: "engagement" },
    ],
    content: `Engagement controls do not become better simply because there are more of them. In many products, too many actions increase friction.\n\nA like button works best when the reader has just experienced a small moment of satisfaction. A save action works best when a piece of content clearly signals future utility.\n\nComments require even more intention, so they should appear when the reader has a reason to react, add context, or disagree.\n\nThe key is not volume of actions but timing and emotional fit.`,
    contentEn: `Engagement controls do not become better simply because there are more of them. In many products, too many actions increase friction.\n\nA like button works best when the reader has just experienced a small moment of satisfaction. A save action works best when a piece of content clearly signals future utility.\n\nComments require even more intention, so they should appear when the reader has a reason to react, add context, or disagree.\n\nThe key is not volume of actions but timing and emotional fit.`,
    contentZhHant: `互動入口不會因為數量變多就自然變得更好。很多產品把點讚、收藏、留言全部堆在最顯眼的位置，結果反而增加了打斷感。\n\n點讚通常適合出現在讀者剛獲得小滿足的時刻；收藏則更適合在內容明顯具有後續價值時出現。\n\n留言需要更強的表達意願，因此應該在讀者有觀點、有補充或想反駁時提供入口。\n\n真正重要的不是互動按鈕有多少，而是它們是否在合適的時機出現。`,
    comments: [],
    likes: ["seed-like-6"],
  },
];

async function main() {
  await prisma.comment.deleteMany();
  await prisma.articleLike.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.article.deleteMany();

  for (const article of articles) {
    await prisma.article.create({
      data: {
        slug: article.slug,
        title: article.title,
        titleEn: article.titleEn,
        titleZhHant: article.titleZhHant,
        excerpt: article.excerpt,
        excerptEn: article.excerptEn,
        excerptZhHant: article.excerptZhHant,
        content: article.content,
        contentEn: article.contentEn,
        contentZhHant: article.contentZhHant,
        category: article.category,
        authorName: article.authorName,
        readTimeMinutes: article.readTimeMinutes,
        publishedAt: article.publishedAt,
        comments: {
          create: article.comments,
        },
        likes: {
          create: article.likes.map((visitorId) => ({ visitorId })),
        },
        tags: {
          create: article.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { slug: tag.slug },
                create: tag,
              },
            },
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
