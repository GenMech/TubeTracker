"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";

interface VideoData {
  title: string;
  views: number;
  thumbnail: string;
}

interface GraphData {
  name: string;
  views: number;
}

const VIDEOS_PER_PAGE = 8;

export default function Home() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [videoData, setVideoData] = useState<VideoData[]>([]);
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/scrapePlaylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch playlist data");
      }

      const data = await response.json();
      setVideoData(data.videoList);
      setGraphData(data.graphData);
      setCurrentPage(1); // Reset to the first page when a new playlist is loaded
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    } else {
      return views.toString();
    }
  };

  console.log("videos data:", videoData);

  // Pagination Logic
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const paginatedVideos = videoData.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>YouTube Playlist Analyzer</CardTitle>
          <CardDescription>
            Enter a YouTube playlist URL to analyze its videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="url"
              placeholder="Enter YouTube playlist URL"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Analyze Playlist"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {videoData.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Video List</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {paginatedVideos.map((video, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <span className="font-bold text-lg min-w-[24px]">
                      {startIndex + index + 1}.
                    </span>
                    <img
                      src={video.thumbnail || "/YouTube_logo.png"}
                      alt={video.title}
                      className="w-24 h-14"
                    />
                    <div>
                      <h3 className="font-semibold">{video.title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatViews(video.views)} views
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex gap-1"
                >
                  <GrFormPreviousLink /> <span>Previous</span>
                </Button>

                <span>
                  Page {currentPage} of{" "}
                  {Math.ceil(videoData.length / VIDEOS_PER_PAGE)}
                </span>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(videoData.length / VIDEOS_PER_PAGE)
                      )
                    )
                  }
                  disabled={endIndex >= videoData.length}
                  className="flex gap-1"
                >
                  <span>Next</span> <GrFormNextLink />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Count Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
