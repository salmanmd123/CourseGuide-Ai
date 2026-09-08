import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AdminCourseType =
  | "VIDEO"
  | "PLAYLIST";

export type CreateAdminCourseInput = {
  url: string;
  courseType: AdminCourseType;

  title?: string;
  description?: string;

  category: string;
  level: string;
  language: string;

  featured?: boolean;
  adminRecommended?: boolean;
};

type YouTubeVideo = {
  id: string;

  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;

    defaultAudioLanguage?: string;
    defaultLanguage?: string;

    thumbnails?: {
      high?: {
        url?: string;
      };

      medium?: {
        url?: string;
      };

      default?: {
        url?: string;
      };
    };
  };

  statistics?: {
    viewCount?: string;
    likeCount?: string;
  };

  contentDetails?: {
    duration?: string;
  };
};

type YouTubePlaylist = {
  id: string;

  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;

    thumbnails?: {
      high?: {
        url?: string;
      };

      medium?: {
        url?: string;
      };

      default?: {
        url?: string;
      };
    };
  };
};

type YouTubePlaylistItem = {
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;

    thumbnails?: {
      high?: {
        url?: string;
      };

      medium?: {
        url?: string;
      };

      default?: {
        url?: string;
      };
    };

    resourceId?: {
      videoId?: string;
    };
  };

  contentDetails?: {
    videoId?: string;
  };
};


/* =========================================================
   API KEY
========================================================= */

function getApiKey() {
  const key =
    process.env.YOUTUBE_API_KEY;

  if (!key) {
    throw new Error(
      "YOUTUBE_API_KEY is not configured"
    );
  }

  return key;
}


/* =========================================================
   THUMBNAIL
========================================================= */

function getThumbnail(
  snippet: any
): string {
  return (
    snippet?.thumbnails?.high?.url ||
    snippet?.thumbnails?.medium?.url ||
    snippet?.thumbnails?.default?.url ||
    ""
  );
}


/* =========================================================
   ISO DURATION → SECONDS
========================================================= */

function parseDuration(
  value?: string
): number {
  if (!value) {
    return 0;
  }

  const match =
    value.match(
      /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i
    );

  if (!match) {
    return 0;
  }

  return (
    Number(match[1] || 0) *
      3600 +
    Number(match[2] || 0) *
      60 +
    Number(match[3] || 0)
  );
}


/* =========================================================
   SECONDS → DISPLAY DURATION
========================================================= */

function formatDuration(
  seconds: number
): string {
  const safe =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const hours =
    Math.floor(
      safe / 3600
    );

  const minutes =
    Math.floor(
      (safe % 3600) / 60
    );

  const remainingSeconds =
    safe % 60;

  if (hours > 0) {
    return remainingSeconds > 0
      ? `${hours}h ${minutes}m ${remainingSeconds}s`
      : `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  return `${remainingSeconds}s`;
}


/* =========================================================
   SLUG
========================================================= */

function slugify(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(0, 160) ||
    "youtube-course";
}


function createSlug(
  title: string,
  identifier: string
): string {
  return `${slugify(
    title
  )}-${slugify(
    identifier
  ).slice(0, 30)}`.slice(
    0,
    195
  );
}


/* =========================================================
   EXTRACT VIDEO ID
========================================================= */

function getVideoId(
  urlString: string
): string | null {
  try {
    const url =
      new URL(
        urlString.trim()
      );

    const host =
      url.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );

    if (
      host ===
      "youtu.be"
    ) {
      return (
        url.pathname
          .split("/")
          .filter(Boolean)[0] ||
        null
      );
    }

    if (
      host ===
        "youtube.com" ||
      host ===
        "m.youtube.com"
    ) {
      const watchId =
        url.searchParams.get(
          "v"
        );

      if (watchId) {
        return watchId;
      }

      const parts =
        url.pathname
          .split("/")
          .filter(Boolean);

      if (
        parts[0] ===
          "shorts" ||
        parts[0] ===
          "embed"
      ) {
        return (
          parts[1] || null
        );
      }
    }
  } catch {
    return null;
  }

  return null;
}


/* =========================================================
   EXTRACT PLAYLIST ID
========================================================= */

function getPlaylistId(
  urlString: string
): string | null {
  try {
    const url =
      new URL(
        urlString.trim()
      );

    const host =
      url.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          ""
        );

    if (
      host !==
        "youtube.com" &&
      host !==
        "m.youtube.com" &&
      host !==
        "youtu.be"
    ) {
      return null;
    }

    return (
      url.searchParams.get(
        "list"
      ) || null
    );
  } catch {
    return null;
  }
}


/* =========================================================
   YOUTUBE GET
========================================================= */

async function youtubeGet(
  endpoint: string,
  params: Record<
    string,
    string
  >
) {
  const url =
    new URL(
      `https://www.googleapis.com/youtube/v3/${endpoint}`
    );

  for (
    const [
      key,
      value,
    ] of Object.entries(
      params
    )
  ) {
    url.searchParams.set(
      key,
      value
    );
  }

  url.searchParams.set(
    "key",
    getApiKey()
  );

  const response =
    await fetch(
      url.toString(),
      {
        cache:
          "no-store",
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => null
      );

  if (
    !response.ok
  ) {
    console.error(
      "YouTube API error:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "YouTube API request failed"
    );
  }

  return data;
}


/* =========================================================
   GET SINGLE VIDEO
========================================================= */

async function getVideo(
  videoId: string
): Promise<YouTubeVideo> {
  const data =
    await youtubeGet(
      "videos",
      {
        part:
          "snippet,statistics,contentDetails",
        id: videoId,
      }
    );

  const video =
    data?.items?.[0] as
      | YouTubeVideo
      | undefined;

  if (!video) {
    throw new Error(
      "YouTube video was not found"
    );
  }

  return video;
}


/* =========================================================
   GET PLAYLIST
========================================================= */

async function getPlaylist(
  playlistId: string
): Promise<YouTubePlaylist> {
  const data =
    await youtubeGet(
      "playlists",
      {
        part:
          "snippet,contentDetails",
        id: playlistId,
      }
    );

  const playlist =
    data?.items?.[0] as
      | YouTubePlaylist
      | undefined;

  if (!playlist) {
    throw new Error(
      "YouTube playlist was not found"
    );
  }

  return playlist;
}


/* =========================================================
   GET PLAYLIST ITEMS
========================================================= */

async function getPlaylistItems(
  playlistId: string
): Promise<
  YouTubePlaylistItem[]
> {
  const items: YouTubePlaylistItem[] =
    [];

  let pageToken = "";

  /*
   * Safety limit.
   *
   * Prevents accidentally importing
   * a playlist containing thousands
   * of videos.
   */

  const maxLessons = 200;

  while (
    items.length <
    maxLessons
  ) {
    const params: Record<
      string,
      string
    > = {
      part:
        "snippet,contentDetails",

      playlistId,

      maxResults: "50",
    };

    if (pageToken) {
      params.pageToken =
        pageToken;
    }

    const data =
      await youtubeGet(
        "playlistItems",
        params
      );

    items.push(
      ...((data?.items ||
        []) as YouTubePlaylistItem[])
    );

    pageToken =
      data?.nextPageToken ||
      "";

    if (!pageToken) {
      break;
    }
  }

  return items.slice(
    0,
    maxLessons
  );
}


/* =========================================================
   GET VIDEO METADATA IN BATCHES
========================================================= */

async function getVideos(
  videoIds: string[]
): Promise<
  YouTubeVideo[]
> {
  const result: YouTubeVideo[] =
    [];

  for (
    let i = 0;
    i < videoIds.length;
    i += 50
  ) {
    const chunk =
      videoIds.slice(
        i,
        i + 50
      );

    if (!chunk.length) {
      continue;
    }

    const data =
      await youtubeGet(
        "videos",
        {
          part:
            "snippet,statistics,contentDetails",

          id:
            chunk.join(","),
        }
      );

    result.push(
      ...((data?.items ||
        []) as YouTubeVideo[])
    );
  }

  return result;
}


/* =========================================================
   VALIDATE URL
========================================================= */

export function validateYouTubeUrl(
  url: string,
  courseType: AdminCourseType
) {
  if (
    courseType ===
      "VIDEO" &&
    !getVideoId(url)
  ) {
    throw new Error(
      "Enter a valid YouTube video URL"
    );
  }

  if (
    courseType ===
      "PLAYLIST" &&
    !getPlaylistId(url)
  ) {
    throw new Error(
      "Enter a valid YouTube playlist URL"
    );
  }
}


/* =========================================================
   CREATE COURSE
========================================================= */

export async function createAdminYouTubeCourse(
  input: CreateAdminCourseInput
) {
  const titleOverride =
    input.title?.trim() ||
    "";

  const descriptionOverride =
    input.description?.trim() ||
    "";

  const category =
    input.category.trim();

  const level =
    input.level.trim();

  const language =
    input.language.trim();

  if (
    !category ||
    !level ||
    !language
  ) {
    throw new Error(
      "Category, level and language are required"
    );
  }

  validateYouTubeUrl(
    input.url,
    input.courseType
  );


  /* =======================================================
     SINGLE VIDEO
  ======================================================= */

  if (
    input.courseType ===
    "VIDEO"
  ) {
    const videoId =
      getVideoId(
        input.url
      )!;

    const video =
      await getVideo(
        videoId
      );

    const snippet =
      video.snippet ||
      {};

    const durationSeconds =
      parseDuration(
        video.contentDetails
          ?.duration
      );

    const title =
      titleOverride ||
      snippet.title ||
      "YouTube Course";

    const description =
      descriptionOverride ||
      snippet.description ||
      "YouTube course";

    const slug =
      createSlug(
        title,
        videoId
      );

    const existing =
      await db
        .select({
          id: courses.id,
        })
        .from(courses)
        .where(
          eq(
            courses.youtubeId,
            videoId
          )
        )
        .limit(1);

    if (
      existing.length
    ) {
      throw new Error(
        "This YouTube video is already added as a course"
      );
    }

    const [course] =
      await db
        .insert(courses)
        .values({
          title,

          slug,

          description,

          category,

          level,

          courseType:
            "VIDEO",

          language,

          youtubeUrl:
            input.url.trim(),

          youtubeId:
            videoId,

          youtubePlaylistId:
            null,

          channelName:
            snippet.channelTitle ||
            "YouTube",

          thumbnailUrl:
            getThumbnail(
              snippet
            ),

          views:
            Number(
              video
                .statistics
                ?.viewCount ||
                0
            ),

          likes:
            Number(
              video
                .statistics
                ?.likeCount ||
                0
            ),

          duration:
            formatDuration(
              durationSeconds
            ),

          lessonsCount:
            1,

          rating:
            "0",

          students:
            "0",

          source:
            "YouTube",

          recommendationScore:
            0,

          adminRecommended:
            Boolean(
              input.adminRecommended
            ),

          featured:
            Boolean(
              input.featured
            ),
        })
        .returning();

    await db
      .insert(lessons)
      .values({
        courseId:
          course.id,

        title,

        description,

        /*
         * The learning player expects
         * the YouTube video ID here.
         */

        videoUrl:
          videoId,

        duration:
          formatDuration(
            durationSeconds
          ),

        order: 1,
      });

    return course;
  }


  /* =======================================================
     PLAYLIST
  ======================================================= */

  const playlistId =
    getPlaylistId(
      input.url
    )!;

  const playlist =
    await getPlaylist(
      playlistId
    );

  const items =
    await getPlaylistItems(
      playlistId
    );

  /*
   * Keep the original item together
   * with its video ID.
   */

  const playlistVideoRefs =
    items
      .map(
        (item) => ({
          item,

          videoId:
            item
              .contentDetails
              ?.videoId ||
            item
              .snippet
              ?.resourceId
              ?.videoId ||
            "",
        })
      )
      .filter(
        (entry) =>
          Boolean(
            entry.videoId
          )
      );

  const videoIds =
    playlistVideoRefs.map(
      (entry) =>
        entry.videoId
    );

  if (
    !videoIds.length
  ) {
    throw new Error(
      "This playlist does not contain any accessible videos"
    );
  }

  const existing =
    await db
      .select({
        id: courses.id,
      })
      .from(courses)
      .where(
        eq(
          courses.youtubePlaylistId,
          playlistId
        )
      )
      .limit(1);

  if (
    existing.length
  ) {
    throw new Error(
      "This YouTube playlist is already added as a course"
    );
  }

  const videos =
    await getVideos(
      videoIds
    );

  const videoMap =
    new Map(
      videos.map(
        (video) => [
          video.id,
          video,
        ]
      )
    );

  const playlistLessons =
    playlistVideoRefs
      .map(
        (
          entry,
          index
        ) => {
          const videoId =
            entry.videoId;

          const video =
            videoMap.get(
              videoId
            );

          if (!video) {
            return null;
          }

          const snippet =
            video.snippet ||
            entry.item
              ?.snippet ||
            {};

          const durationSeconds =
            parseDuration(
              video
                .contentDetails
                ?.duration
            );

          return {
            videoId,

            title:
              snippet.title ||
              `Lesson ${
                index + 1
              }`,

            description:
              snippet.description ||
              "",

            duration:
              formatDuration(
                durationSeconds
              ),

            durationSeconds,

            order:
              index + 1,
          };
        }
      )
      .filter(
        Boolean
      ) as {
      videoId: string;
      title: string;
      description: string;
      duration: string;
      durationSeconds: number;
      order: number;
    }[];

  if (
    !playlistLessons.length
  ) {
    throw new Error(
      "No accessible videos were found in this playlist"
    );
  }

  const title =
    titleOverride ||
    playlist
      .snippet
      ?.title ||
    "YouTube Playlist Course";

  const description =
    descriptionOverride ||
    playlist
      .snippet
      ?.description ||
    "YouTube course playlist";

  const totalSeconds =
    playlistLessons.reduce(
      (
        sum,
        lesson
      ) =>
        sum +
        lesson.durationSeconds,
      0
    );

  const firstVideo =
    videoMap.get(
      playlistLessons[0]
        .videoId
    );

  const channelName =
    playlist
      .snippet
      ?.channelTitle ||
    firstVideo
      ?.snippet
      ?.channelTitle ||
    "YouTube";

  const [course] =
    await db
      .insert(courses)
      .values({
        title,

        slug:
          createSlug(
            title,
            playlistId
          ),

        description,

        category,

        level,

        courseType:
          "PLAYLIST",

        language,

        youtubeUrl:
          input.url.trim(),

        youtubeId:
          null,

        youtubePlaylistId:
          playlistId,

        channelName,

        thumbnailUrl:
          getThumbnail(
            playlist.snippet
          ) ||
          getThumbnail(
            firstVideo?.snippet
          ),

        views:
          Number(
            firstVideo
              ?.statistics
              ?.viewCount ||
              0
          ),

        likes:
          Number(
            firstVideo
              ?.statistics
              ?.likeCount ||
              0
          ),

        duration:
          formatDuration(
            totalSeconds
          ),

        lessonsCount:
          playlistLessons.length,

        rating:
          "0",

        students:
          "0",

        source:
          "YouTube",

        recommendationScore:
          0,

        adminRecommended:
          Boolean(
            input.adminRecommended
          ),

        featured:
          Boolean(
            input.featured
          ),
      })
      .returning();

  await db
    .insert(lessons)
    .values(
      playlistLessons.map(
        (lesson) => ({
          courseId:
            course.id,

          title:
            lesson.title,

          description:
            lesson.description,

          videoUrl:
            lesson.videoId,

          duration:
            lesson.duration,

          order:
            lesson.order,
        })
      )
    );

  return course;
}