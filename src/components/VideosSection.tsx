
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Eye, ThumbsUp, Clock } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
  likes: number;
  reward: number;
  watched: boolean;
  description: string;
}

export const VideosSection = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      title: 'Funny Cat Compilation 2024',
      thumbnail: '🐱',
      duration: '5:30',
      category: 'Comedy',
      views: 125000,
      likes: 8900,
      reward: 5,
      watched: false,
      description: 'Hilarious cat moments that will make your day better!'
    },
    {
      id: '2',
      title: 'Amazing Nature Documentary',
      thumbnail: '🌿',
      duration: '12:45',
      category: 'Nature',
      views: 89000,
      likes: 5400,
      reward: 10,
      watched: false,
      description: 'Explore the wonders of wildlife in this stunning documentary.'
    },
    {
      id: '3',
      title: 'Quick Cooking Tips & Tricks',
      thumbnail: '🍳',
      duration: '8:15',
      category: 'Lifestyle',
      views: 67000,
      likes: 4200,
      reward: 8,
      watched: false,
      description: 'Learn professional cooking techniques in just 8 minutes!'
    },
    {
      id: '4',
      title: 'Top 10 Tech Gadgets 2024',
      thumbnail: '📱',
      duration: '15:20',
      category: 'Technology',
      views: 234000,
      likes: 12000,
      reward: 15,
      watched: false,
      description: 'Discover the coolest tech gadgets that are changing the world.'
    },
    {
      id: '5',
      title: 'Relaxing Music for Study',
      thumbnail: '🎵',
      duration: '30:00',
      category: 'Music',
      views: 156000,
      likes: 9800,
      reward: 20,
      watched: false,
      description: 'Perfect background music for productivity and relaxation.'
    },
    {
      id: '6',
      title: 'Epic Gaming Moments',
      thumbnail: '🎮',
      duration: '10:30',
      category: 'Gaming',
      views: 345000,
      likes: 18500,
      reward: 12,
      watched: false,
      description: 'The most incredible gaming moments caught on camera!'
    }
  ]);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const watchVideo = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    setSelectedVideo(video);
    
    // Simulate watching the video
    setTimeout(() => {
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, watched: true } : v
      ));
      
      toast({
        title: '🎬 Video Watched!',
        description: `You earned ${video.reward} coins for watching "${video.title}"`,
      });
      
      setSelectedVideo(null);
    }, 3000); // Simulate 3 seconds of watching
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Comedy': return 'bg-yellow-500';
      case 'Nature': return 'bg-green-500';
      case 'Lifestyle': return 'bg-purple-500';
      case 'Technology': return 'bg-blue-500';
      case 'Music': return 'bg-pink-500';
      case 'Gaming': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const watchedVideos = videos.filter(v => v.watched).length;
  const totalEarned = videos.filter(v => v.watched).reduce((sum, v) => sum + v.reward, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white text-xl font-bold mb-4">📺 Viewing Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{watchedVideos}/{videos.length}</div>
            <div className="text-white/80 text-sm">Videos Watched</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalEarned}</div>
            <div className="text-white/80 text-sm">Coins Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round((watchedVideos / videos.length) * 100)}%</div>
            <div className="text-white/80 text-sm">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedVideo.thumbnail}</div>
              <h3 className="text-white text-xl font-bold mb-2">{selectedVideo.title}</h3>
              <p className="text-white/80 mb-4">Watching video... Please wait</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <p className="text-white/60 text-sm">Earning {selectedVideo.reward} coins...</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all">
            <div className="relative p-6 text-center">
              <div className="text-4xl mb-2">{video.thumbnail}</div>
              <div className="absolute top-2 right-2">
                <Badge className={`${getCategoryColor(video.category)} text-white text-xs`}>
                  {video.category}
                </Badge>
              </div>
              {video.watched && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-500 text-white text-xs">✅ Watched</Badge>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h4 className="text-white font-semibold mb-2 text-sm">{video.title}</h4>
              <p className="text-white/70 text-xs mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {formatViews(video.views)}
                  </span>
                  <span className="flex items-center">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {formatViews(video.likes)}
                  </span>
                </div>
                <span className="text-yellow-400 font-semibold">+{video.reward} coins</span>
              </div>
              
              {video.watched ? (
                <Button disabled className="w-full bg-green-600 text-white opacity-75">
                  ✅ Watched
                </Button>
              ) : (
                <Button 
                  onClick={() => watchVideo(video.id)}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch & Earn
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
