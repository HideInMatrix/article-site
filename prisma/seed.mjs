import { PrismaLibSql } from "@prisma/adapter-libsql";
import prismaClientPkg from "@prisma/client";

const { PrismaClient } = prismaClientPkg;

const adapter = new PrismaLibSql({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

const articles = [
  {
    slug: "write-longform-that-gets-finished",
    title: "怎么设计一篇会让人愿意读完的长文？",
    excerpt: "从标题、开头、段落节奏到结尾互动，系统性提升文章的阅读完成率。",
    category: "写作方法",
    authorName: "David",
    readTimeMinutes: 8,
    publishedAt: new Date("2026-03-18T09:00:00.000Z"),
    tags: [
      { slug: "longform-writing", name: "长文写作" },
      { slug: "content-structure", name: "内容结构" },
      { slug: "reading-retention", name: "阅读完成率" },
    ],
    content: `真正让人愿意读完的长文，不是信息最多，而是节奏最好。

第一步先解决标题。标题不只是“告诉用户这篇文章写什么”，还要给读者一个继续往下看的理由：是方法、案例、还是一个悬而未决的问题。

第二步是开头。好的开头不应该绕太久，而要在三到五句话之内建立阅读预期。用户读到这里就会判断：这篇文章值不值得继续花时间。

第三步是正文的段落组织。长文不是把内容堆长，而是把每一段都变成一个小的推进点。每个小标题都应该像路标，帮助读者降低迷失感。

最后是结尾。结尾不是简单总结，而是把“读完之后下一步能做什么”交还给读者。你可以引导评论、提问、收藏，或者让用户进入相关文章。`,
    comments: [
      {
        authorName: "Mia",
        content: "我很认同“结尾要给下一步动作”这个点，很多内容站都忽略了。",
      },
      {
        authorName: "Leo",
        content: "如果后面能再加几个长文结构模板就更好了。",
      },
    ],
    likes: ["seed-like-1", "seed-like-2", "seed-like-3"],
  },
  {
    slug: "community-cold-start-first-100-readers",
    title: "社区冷启动：前 100 位读者到底该怎么来？",
    excerpt: "早期不要急着投放，先把内容结构、讨论机制和分发路径做通。",
    category: "社区增长",
    authorName: "David",
    readTimeMinutes: 6,
    publishedAt: new Date("2026-03-19T09:30:00.000Z"),
    tags: [
      { slug: "cold-start", name: "冷启动" },
      { slug: "community-growth", name: "社区增长" },
      { slug: "distribution", name: "内容分发" },
    ],
    content: `大多数内容社区在冷启动阶段做错的第一件事，就是把注意力全放在“拉新数量”上。

如果文章本身没有形成稳定的讨论回路，用户来了也只是看一眼就走。真正应该先打磨的是：内容有没有明确定位、首页有没有结构感、文章页有没有自然的互动入口。

前一百位读者最重要的不是规模，而是反馈质量。你需要观察他们停在哪里、聊什么、愿不愿意留下评论，以及哪些文章能自然带来第二次访问。

早期最有效的增长往往来自高密度的小分发：朋友网络、垂直社群、作者转发，以及自己可持续产出的系列内容。`,
    comments: [
      {
        authorName: "Ava",
        content: "确实，先把讨论闭环打通，比盲目拉新更重要。",
      },
    ],
    likes: ["seed-like-4", "seed-like-5"],
  },
  {
    slug: "when-to-show-like-save-comment-actions",
    title: "点赞、收藏、评论，分别应该在什么时机出现？",
    excerpt: "互动入口不是越多越好，而是要在用户最自然的时刻出现。",
    category: "产品设计",
    authorName: "David",
    readTimeMinutes: 5,
    publishedAt: new Date("2026-03-20T01:00:00.000Z"),
    tags: [
      { slug: "product-design", name: "产品设计" },
      { slug: "interaction-design", name: "交互设计" },
      { slug: "engagement", name: "互动设计" },
    ],
    content: `很多页面把点赞、收藏、评论同时堆在最显眼的位置，结果反而增加了打断感。

点赞适合在“用户刚刚获得一个小满足”的时刻出现，比如读完一段、看到结论、滑到结尾。

收藏通常意味着用户想“以后再看”，所以它更适合出现在文章有清晰知识价值的时候，比如方法总结、资料清单、步骤指南附近。

评论则是表达欲最强的动作，应该在用户有观点、想补充或想反驳的时候提供入口。最常见的位置是结尾，但如果中间有强观点段落，也可以设计局部讨论。`,
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
        excerpt: article.excerpt,
        content: article.content,
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
