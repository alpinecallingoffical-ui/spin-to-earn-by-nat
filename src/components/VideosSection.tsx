
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  reward: number;
  category: string;
}

const videos: Video[] = [
  {
    id: 'crypto-basics',
    title: 'Cryptocurrency Basics',
    description: 'Learn the fundamentals of cryptocurrency',
    thumbnail: '📈',
    duration: '5:30',
    reward: 25,
    category: 'Education'
  },
  {
    id: 'gaming-tips',
    title: 'Pro Gaming Tips',
    description: 'Improve your gaming skills with expert advice',
    thumbnail: '🎮',
    duration: '8:15',
    reward: 35,
    category: 'Gaming'
  },
  {
    id: 'tech-news',
    title: 'Latest Tech News',
    description: 'Stay updated with the latest technology trends',
    thumbnail: '💻',
    duration: '6:45',
    reward: 30,
    category: 'Technology'
  },
  {
    id: 'investment-guide',
    title: 'Investment Guide',
    description: 'Smart investing strategies for beginners',
    thumbnail: '💰',
    duration: '10:20',
    reward: 50,
    category: 'Finance'
  },
  {
    id: 'productivity-hacks',
    title: 'Productivity Hacks',
    description: 'Boost your productivity with these simple tips',
    thumbnail: '⚡',
    duration: '4:50',
    reward: 20,
    category: 'Lifestyle'
  },
  {
    id: 'coding-tutorial',
    title: 'Coding Tutorial',
    description: 'Learn programming from scratch',
    thumbnail: '👨‍💻',
    duration: '12:30',
    reward: 60,
    category: 'Education'
  }
];

export const VideosSection: React.FC = () => {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [watchingVideo, setWatchingVideo] = useState<Video | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);

  const handleWatchVideo = (video: Video) => {
    if (watchedVideos.includes(video.id)) {
      toast({
        title: 'Already Watched',
        description: 'You have already watched this video today.',
        variant: 'destructive',
      });
      return;
    }

    setWatchingVideo(video);
    toast({
      title: '📺 Video Starting!',
      description: `Watching ${video.title}. Enjoy!`,
    });

    // Simulate video watching
    setTimeout(() => {
      toast({
        title: '🎉 Video Complete!',
        description: `You earned ${video.reward} coins for watching!`,
      });
      setWatchedVideos(prev => [...prev, video.id]);
      setWatchingVideo(null);
    }, 5000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Education': return 'bg-blue-500';
      case 'Gaming': return 'bg-green-500';
      case 'Technology': return 'bg-purple-500';
      case 'Finance': return 'bg-yellow-500';
      case 'Lifestyle': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-2">📺 Watch & Earn</h2>
        <p className="text-white/80">Watch educational videos and earn coins!</p>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:bg-white/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{video.thumbnail}</div>
              <div className={`text-xs font-bold text-white px-3 py-1 rounded-full ${getCategoryColor(video.category)}`}>
                {video.category}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
            <p className="text-white/80 text-sm mb-4">{video.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Duration:</span>
                <span className="text-blue-400 font-bold">{video.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Reward:</span>
                <span className="text-green-400 font-bold">+{video.reward} coins</span>
              </div>
            </div>

            <button
              onClick={() => handleWatchVideo(video)}
              disabled={watchingVideo !== null || watchedVideos.includes(video.id)}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                !watchedVideos.includes(video.id) && watchingVideo === null
                  ? 'bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {watchingVideo?.id === video.id ? (
                <>⏳ Watching...</>
              ) : watchedVideos.includes(video.id) ? (
                <>✅ Watched</>
              ) : (
                <>▶️ Watch Now</>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Viewing Stats */}
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">📊 Viewing Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-2xl p-4 text-center">
            <p className="text-white/80 text-sm">Videos Watched</p>
            <p className="text-white font-bold text-2xl">{watchedVideos.length}</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 text-center">
            <p className="text-white/80 text-sm">Coins Earned</p>
            <p className="text-green-400 font-bold text-2xl">
              {watchedVideos.reduce((total, videoId) => {
                const video = videos.find(v => v.id === videoId);
                return total + (video?.reward || 0);
              }, 0)}
            </p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 text-center">
            <p className="text-white/80 text-sm">Completion</p>
            <p className="text-yellow-400 font-bold text-2xl">
              {Math.round((watchedVideos.length / videos.length) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
