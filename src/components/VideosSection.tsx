
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  reward: number;
  category: 'Entertainment' | 'Educational' | 'Gaming' | 'Tech';
}

const videos: Video[] = [
  {
    id: 'tech1',
    title: 'Latest Tech Trends 2024',
    description: 'Discover the hottest technology trends shaping the future',
    thumbnail: '📱',
    duration: '5:30',
    reward: 15,
    category: 'Tech'
  },
  {
    id: 'game1',
    title: 'Gaming Tips & Tricks',
    description: 'Master your favorite games with these pro tips',
    thumbnail: '🎮',
    duration: '8:15',
    reward: 20,
    category: 'Gaming'
  },
  {
    id: 'edu1',
    title: 'Quick Math Tricks',
    description: 'Learn amazing mathematical shortcuts and tricks',
    thumbnail: '🧮',
    duration: '6:45',
    reward: 25,
    category: 'Educational'
  },
  {
    id: 'ent1',
    title: 'Funny Moments Compilation',
    description: 'Laugh with this hilarious compilation of funny moments',
    thumbnail: '😂',
    duration: '10:20',
    reward: 18,
    category: 'Entertainment'
  },
  {
    id: 'tech2',
    title: 'AI Revolution Explained',
    description: 'Understanding artificial intelligence and its impact',
    thumbnail: '🤖',
    duration: '12:30',
    reward: 30,
    category: 'Tech'
  },
  {
    id: 'edu2',
    title: 'Science Experiments',
    description: 'Cool science experiments you can do at home',
    thumbnail: '🔬',
    duration: '9:10',
    reward: 22,
    category: 'Educational'
  }
];

export const VideosSection: React.FC = () => {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [currentlyWatching, setCurrentlyWatching] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Entertainment', 'Educational', 'Gaming', 'Tech'];

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const handleWatchVideo = (video: Video) => {
    if (watchedVideos.has(video.id)) {
      toast({
        title: 'Already Watched',
        description: 'You have already watched this video and earned the reward.',
        variant: 'destructive',
      });
      return;
    }

    setCurrentlyWatching(video.id);
    toast({
      title: '📺 Watching Video',
      description: `Starting "${video.title}". Watch to completion to earn ${video.reward} coins!`,
    });

    // Simulate video watching (you can replace this with actual video player)
    const duration = parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1]);
    const watchTime = Math.min(duration * 100, 10000); // Max 10 seconds for demo

    setTimeout(() => {
      setWatchedVideos(prev => new Set([...prev, video.id]));
      setCurrentlyWatching(null);
      toast({
        title: '🎉 Video Completed!',
        description: `Great job! You earned ${video.reward} coins for watching "${video.title}"`,
      });
    }, watchTime);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Entertainment': return 'bg-pink-500';
      case 'Educational': return 'bg-blue-500';
      case 'Gaming': return 'bg-green-500';
      case 'Tech': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const totalEarned = Array.from(watchedVideos).reduce((total, videoId) => {
    const video = videos.find(v => v.id === videoId);
    return total + (video?.reward || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center">
            📺 Watch & Earn Videos
            <span className="ml-3 text-sm bg-gradient-to-r from-red-400 to-pink-500 text-white px-3 py-1 rounded-full">
              Watch for Coins!
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 mb-4">
            Watch interesting videos and earn coins! Each video can only be watched once for rewards.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-red-500 text-white'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{video.thumbnail}</div>
                    <div className={`text-xs font-bold text-white px-2 py-1 rounded-full ${getCategoryColor(video.category)}`}>
                      {video.category}
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg line-clamp-2">{video.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80 text-sm line-clamp-3">{video.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Duration:</span>
                      <span className="text-blue-400 font-bold">{video.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Reward:</span>
                      <span className="text-green-400 font-bold">{video.reward} coins</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleWatchVideo(video)}
                    disabled={watchedVideos.has(video.id) || currentlyWatching !== null}
                    className={`w-full py-2 rounded-xl font-semibold transition-all ${
                      watchedVideos.has(video.id)
                        ? 'bg-gray-500 text-gray-300'
                        : currentlyWatching === video.id
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    {watchedVideos.has(video.id) ? (
                      <>✅ Watched</>
                    ) : currentlyWatching === video.id ? (
                      <>📺 Watching...</>
                    ) : (
                      <>▶️ Watch Now</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Stats */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">📊 Watching Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Videos Watched</p>
              <p className="text-white font-bold text-2xl">{watchedVideos.size}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Total Earned</p>
              <p className="text-green-400 font-bold text-2xl">{totalEarned}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Available Videos</p>
              <p className="text-blue-400 font-bold text-2xl">{videos.length - watchedVideos.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
