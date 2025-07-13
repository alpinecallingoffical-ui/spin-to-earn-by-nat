
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Eye, ThumbsUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { AdsterraAd } from './AdsterraAd';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
  likes: number;
  reward: number;
  description: string;
}

interface VideoWatch {
  id: string;
  video_id: string;
  video_title: string;
  reward_coins: number;
  watched_at: string;
}

const videos: Video[] = [
  {
    id: '1',
    title: 'Funny Cat Compilation 2024',
    thumbnail: '🐱',
    duration: '5:30',
    category: 'Comedy',
    views: 125000,
    likes: 8900,
    reward: 5,
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
    description: 'The most incredible gaming moments caught on camera!'
  }
];

export const VideosSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData, refetch } = useUserData();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<VideoWatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adWaitTime, setAdWaitTime] = useState(0);
  const [canClaimReward, setCanClaimReward] = useState(false);

  const getVipMultiplier = (coins: number) => {
    if (coins >= 3000) return 10; // Grand Master
    if (coins >= 2000) return 5;  // Elite Master
    if (coins >= 1000) return 2;  // VIP
    return 1; // Regular
  };

  const fetchWatchedVideos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('video_watches')
        .select('*')
        .eq('user_id', user.id)
        .gte('watched_at', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      setWatchedVideos(data || []);
    } catch (error) {
      console.error('Error fetching watched videos:', error);
    }
  };

  const watchVideo = async (video: Video) => {
    if (!user) return;

    setSelectedVideo(video);
    setShowAdModal(true);
    setAdWaitTime(0);
    setCanClaimReward(false);
    
    // Start the 10-second timer
    const timer = setInterval(() => {
      setAdWaitTime(prev => {
        if (prev >= 9) {
          setCanClaimReward(true);
          clearInterval(timer);
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const claimVideoReward = async () => {
    if (!selectedVideo || !canClaimReward) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('record_video_watch', {
        user_uuid: user.id,
        video_id_param: selectedVideo.id,
        video_title_param: selectedVideo.title,
        reward_amount: selectedVideo.reward
      });

      if (error) throw error;

      if (data) {
        const multiplier = getVipMultiplier(userData?.coins || 0);
        const finalReward = selectedVideo.reward * multiplier;
        
        toast({
          title: '🎬 Video Watched!',
          description: `You earned ${finalReward} coins for watching "${selectedVideo.title}"${multiplier > 1 ? ` (${multiplier}x VIP bonus!)` : ''}`,
        });
        
        await fetchWatchedVideos();
        await refetch();
      } else {
        toast({
          title: 'Already Watched',
          description: 'You have already watched this video today!',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error recording video watch:', error);
      toast({
        title: 'Error',
        description: 'Failed to record video watch. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setSelectedVideo(null);
      setShowAdModal(false);
      setAdWaitTime(0);
      setCanClaimReward(false);
    }
  };

  const closeAdModal = () => {
    if (!canClaimReward) {
      toast({
        title: 'No Reward',
        description: 'You need to wait 10 seconds to earn the reward!',
        variant: 'destructive',
      });
    }
    setSelectedVideo(null);
    setShowAdModal(false);
    setAdWaitTime(0);
    setCanClaimReward(false);
  };

  useEffect(() => {
    if (user) {
      fetchWatchedVideos();
    }
  }, [user]);

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

  const isVideoWatched = (videoId: string) => {
    return watchedVideos.some(watch => watch.video_id === videoId);
  };

  const vipMultiplier = getVipMultiplier(userData?.coins || 0);
  const totalEarned = watchedVideos.reduce((sum, watch) => sum + watch.reward_coins, 0);

  return (
    <div className="space-y-6">
      {/* VIP Status Banner */}
      {vipMultiplier > 1 && (
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl p-4 border border-purple-400/50">
          <div className="text-center">
            <p className="text-purple-300 font-bold animate-pulse">🎬 VIP VIDEO BENEFITS ACTIVE! 🎬</p>
            <p className="text-white/90">All video rewards have {vipMultiplier}x multiplier!</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white text-xl font-bold mb-4">📺 Viewing Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{watchedVideos.length}/{videos.length}</div>
            <div className="text-white/80 text-sm">Videos Watched Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalEarned}</div>
            <div className="text-white/80 text-sm">Coins Earned Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round((watchedVideos.length / videos.length) * 100)}%</div>
            <div className="text-white/80 text-sm">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      {showAdModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-bold">Watch Ad to Earn Coins</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeAdModal}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
              
              {/* Adsterra Social Banner */}
              <div className="bg-white/10 rounded-xl p-4 mb-4 mobile-spacing">
                <AdsterraAd />
              </div>
              
              <div className="text-6xl mb-4">{selectedVideo.thumbnail}</div>
              <h4 className="text-white text-lg font-bold mb-2">{selectedVideo.title}</h4>
              
              {!canClaimReward ? (
                <>
                  <p className="text-white/80 mb-4">
                    Please wait {10 - adWaitTime} seconds to claim your reward
                  </p>
                  <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000" 
                      style={{width: `${(adWaitTime / 10) * 100}%`}}
                    ></div>
                  </div>
                  <p className="text-white/60 text-sm">
                    Will earn {selectedVideo.reward * vipMultiplier} coins
                    {vipMultiplier > 1 && (
                      <span className="text-yellow-300 font-bold"> ({vipMultiplier}x VIP bonus!)</span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-green-400 mb-4 font-bold">✅ You can now claim your reward!</p>
                  <Button
                    onClick={claimVideoReward}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white mb-4"
                  >
                    {loading ? '⏳ Claiming...' : `🎁 Claim ${selectedVideo.reward * vipMultiplier} Coins`}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const watched = isVideoWatched(video.id);
          const finalReward = video.reward * vipMultiplier;

          return (
            <div key={video.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all">
              <div className="relative p-6 text-center">
                <div className="text-4xl mb-2">{video.thumbnail}</div>
                <div className="absolute top-2 right-2">
                  <Badge className={`${getCategoryColor(video.category)} text-white text-xs`}>
                    {video.category}
                  </Badge>
                </div>
                {watched && (
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
                  <span className="text-yellow-400 font-semibold flex items-center">
                    +{finalReward} coins
                    {vipMultiplier > 1 && (
                      <span className="ml-1 text-xs bg-yellow-500 text-white px-1 py-0.5 rounded">
                        {vipMultiplier}x
                      </span>
                    )}
                  </span>
                </div>
                
                {watched ? (
                  <Button disabled className="w-full bg-green-600 text-white opacity-75">
                    ✅ Watched Today
                  </Button>
                ) : (
                  <Button 
                    onClick={() => watchVideo(video)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {loading && selectedVideo?.id === video.id ? '⏳ Watching...' : 'Watch & Earn'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
