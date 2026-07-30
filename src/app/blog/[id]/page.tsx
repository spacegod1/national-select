import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckInButton } from "@/components/booking-modal";
import { POSTS, getPost } from "@/lib/site-data";

export function generateStaticParams() {
  return POSTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getPost(id);
  if (!post) return { title: "Health news — National Select Urgent Care" };
  return { title: `${post.title} — National Select Urgent Care`, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPost(id);
  if (!post) notFound();

  return (
    <main>
      <article className="mx-auto max-w-[760px] px-[clamp(16px,4vw,40px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(26px,4vw,48px)]">
        <div className="mb-[26px] flex flex-wrap items-center gap-2 text-[14px] text-muted">
          <Link href="/blog" className="font-semibold text-[#e8342b] no-underline hover:text-[#b4231c] hover:no-underline">
            Health news
          </Link>
          <span aria-hidden="true">/</span>
          <span>{post.category}</span>
        </div>
        <h1 className="mb-[18px] font-display text-[clamp(32px,4.6vw,52px)] font-extrabold leading-[1.06] tracking-[-.032em] text-balance">
          {post.title}
        </h1>
        <div className="mb-[30px] flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-line pb-[26px] font-mono text-[13px] text-muted">
          <span>{post.date}</span>
          <span aria-hidden="true">·</span>
          <span>{post.read}</span>
          <span aria-hidden="true">·</span>
          <span>By {post.author}</span>
        </div>
        <p className="mb-7 text-[21px] leading-[1.55] text-ink text-pretty">{post.lede}</p>

        {post.body.map((b, i) => (
          <div key={i} className="mb-[26px]">
            {b.t === "h" ? (
              <h2 className="font-display text-[26px] font-bold tracking-[-.022em]">{b.text}</h2>
            ) : (
              <p className="text-[18px] leading-[1.7] text-ink-soft text-pretty">{b.text}</p>
            )}
          </div>
        ))}

        <div className="mt-2 rounded-[18px] border border-pink-line bg-pink p-[26px]">
          <h3 className="mb-2.5 font-display text-[20px] font-bold tracking-[-.018em] text-[#b4231c]">
            Come see us if
          </h3>
          <p className="mb-[18px] text-[16.5px] leading-[1.6] text-pink-ink text-pretty">
            {post.comeIn}
          </p>
          <CheckInButton className="rounded-[12px] bg-[#e8342b] px-6 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#ce291f]" />
        </div>

        <div className="mt-10 border-t border-line pt-[26px] text-[14.5px] leading-[1.6] text-muted text-pretty">
          This article is general information, not medical advice for your specific situation. If
          you&apos;re worried about a symptom, call us or come in — that&apos;s what we&apos;re here
          for.
        </div>
      </article>
    </main>
  );
}
