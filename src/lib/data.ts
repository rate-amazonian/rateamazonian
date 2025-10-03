export type Amazonian = {
  username: string;
  full_name: string;
  job_title: string;
  department_name?: string;
  level?: number;
  is_manager?: boolean;
  direct_reports?: number;
  photo_url?: string;
};

export type Rating = {
  username: string;
  rating: number; // 1-5
  nickname?: string;
  created_at: number;
};

export type Comment = {
  id: string;
  username: string;
  content: string;
  nickname?: string;
  created_at: number;
  parent_id?: string | null;
  upvotes?: number;
  downvotes?: number;
};

const RATINGS_KEY = "ra_ratings_v1";
const COMMENTS_KEY = "ra_comments_v1";
// bump cache key to ensure we refresh when switching data sources
const CACHE_KEY = "ra_amazonians_cache_v6";

export async function loadAmazonians(category?: string): Promise<Amazonian[]> {
  const cacheKey = category ? `${CACHE_KEY}_${category}` : CACHE_KEY;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  // Load from category files if category specified
  if (category) {
    try {
      const res = await fetch(`/employees/${category}.json`, { cache: "no-store" });
      if (res.ok) {
        const raw = await res.json();
        const employees = Array.isArray(raw?.employees) ? raw.employees : [];
        if (employees.length > 0) {
          const mapped: Amazonian[] = employees.map((e: any) => ({
            username: e.username,
            full_name: e.full_name,
            job_title: e.job_title,
            department_name: e.department_name,
            level: e.level,
            is_manager: e.is_manager,
            direct_reports: e.direct_reports,
            photo_url: e.photo_url,
          }));
          localStorage.setItem(cacheKey, JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch (error) {
      console.error(`Failed to load ${category} data:`, error);
    }
  }

  // Fallback: existing small dataset
  const res = await fetch("/amazonians.json", { cache: "no-store" });
  const data = (await res.json()) as Amazonian[];
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

export async function getCategories() {
  try {
    console.log("Loading categories...");
    const res = await fetch("/employees/index.json", { cache: "no-store" });
    console.log("Categories response:", res.status, res.ok);
    if (res.ok) {
      const data = await res.json();
      console.log("Categories loaded:", data);
      return data;
    }
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
  return null;
}

export function searchAmazonians(all: Amazonian[], q: string): Amazonian[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return all.filter((p) =>
    [p.full_name, p.job_title, p.department_name, p.username]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(query))
  );
}

export function getRatings(): Rating[] {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRating(entry: Omit<Rating, "created_at">) {
  const items = getRatings();
  items.push({ ...entry, created_at: Date.now() });
  localStorage.setItem(RATINGS_KEY, JSON.stringify(items));
}

export function getComments(): Comment[] {
  try {
    return JSON.parse(localStorage.getItem(COMMENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addComment(entry: Omit<Comment, "id" | "created_at" | "upvotes" | "downvotes">) {
  const items = getComments();
  const id = `c_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  items.unshift({ ...entry, id, created_at: Date.now(), upvotes: 0, downvotes: 0 });
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(items));
}

export function voteComment(id: string, delta: 1 | -1) {
  const items = getComments();
  const idx = items.findIndex((c) => c.id === id);
  if (idx >= 0) {
    const c = items[idx];
    if (delta === 1) c.upvotes = (c.upvotes || 0) + 1;
    else c.downvotes = (c.downvotes || 0) + 1;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(items));
  }
}

export function aggregateStats(people: Amazonian[]) {
  const ratings = getRatings();
  const byUser = new Map<string, { sum: number; count: number }>();
  for (const r of ratings) {
    const key = r.username;
    const agg = byUser.get(key) || { sum: 0, count: 0 };
    agg.sum += r.rating;
    agg.count += 1;
    byUser.set(key, agg);
  }
  const decorated = people.map((p) => {
    const agg = byUser.get(p.username) || { sum: 0, count: 0 };
    const average_rating = agg.count ? agg.sum / agg.count : 0;
    const comments = getComments().filter((c) => c.username === p.username);
    const total_ratings = agg.count;
    const total_comments = comments.length;
    const total_likes = comments.reduce((s, c) => s + (c.upvotes || 0), 0);
    const total_dislikes = comments.reduce((s, c) => s + (c.downvotes || 0), 0);
    return { ...p, average_rating, total_ratings, total_comments, total_likes, total_dislikes } as any;
  });
  return decorated;
}

export function getTrending(people: Amazonian[], lookbackMs = 1000 * 60 * 60 * 24 * 7) {
  const since = Date.now() - lookbackMs;
  const comments = getComments().filter((c) => c.created_at >= since);
  const counts = new Map<string, number>();
  for (const c of comments) counts.set(c.username, (counts.get(c.username) || 0) + 1);
  return aggregateStats(people)
    .filter((p) => counts.has(p.username))
    .sort((a, b) => (counts.get(b.username)! - counts.get(a.username)!))
    .slice(0, 5);
}


