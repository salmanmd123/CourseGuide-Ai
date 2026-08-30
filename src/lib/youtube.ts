type YouTubeCourseResult = {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelName: string;
    publishedAt: string;
};

export async function searchYouTubeCourses(
    query: string
): Promise<YouTubeCourseResult[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error("YOUTUBE_API_KEY is not configured");
    }

    const url = new URL(
        "https://www.googleapis.com/youtube/v3/search"
    );

    url.searchParams.set("part", "snippet");
    url.searchParams.set(
        "q",
        `${query} complete course`
    );
    url.searchParams.set("type", "video");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
        const error = await response.text();

        console.error("YouTube API error:", error);

        throw new Error("YouTube search failed");
    }

    const data = await response.json();

    return (data.items || []).map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url,
        channelName: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
    }));
}
export async function getYouTubeVideoStatistics(
    videoIds: string[]
) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error("YOUTUBE_API_KEY is not configured");
    }

    if (videoIds.length === 0) {
        return [];
    }

    const url = new URL(
        "https://www.googleapis.com/youtube/v3/videos"
    );

    url.searchParams.set(
        "part",
        "statistics,contentDetails"
    );

    url.searchParams.set(
        "id",
        videoIds.join(",")
    );

    url.searchParams.set(
        "key",
        apiKey
    );

    const response = await fetch(url.toString());

    if (!response.ok) {
        const error = await response.text();

        console.error(
            "YouTube statistics error:",
            error
        );

        throw new Error(
            "Failed to fetch YouTube statistics"
        );
    }

    const data = await response.json();

    return data.items || [];
}