
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';

interface Task {
  id: string;
  task_type: string;
  task_title: string;
  task_description: string;
  reward_coins: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface TaskTemplate {
  task_type: string;
  task_title: string;
  task_description: string;
  reward_coins: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeEstimate: string;
}

const taskTemplates: TaskTemplate[] = [
  {
    task_type: 'daily_checkin',
    task_title: 'Daily Check-in',
    task_description: 'Log in to the app and claim your daily bonus',
    reward_coins: 10,
    difficulty: 'easy',
    category: 'Daily',
    timeEstimate: '1 min'
  },
  {
    task_type: 'watch_videos',
    task_title: 'Watch 3 Videos',
    task_description: 'Watch 3 entertainment videos to earn coins',
    reward_coins: 25,
    difficulty: 'easy',
    category: 'Entertainment',
    timeEstimate: '15 min'
  },
  {
    task_type: 'complete_spins',
    task_title: 'Complete 5 Spins',
    task_description: 'Use the spin wheel 5 times today',
    reward_coins: 30,
    difficulty: 'medium',
    category: 'Gaming',
    timeEstimate: '10 min'
  },
  {
    task_type: 'invite_friend',
    task_title: 'Invite a Friend',
    task_description: 'Share your referral code and get a friend to join',
    reward_coins: 100,
    difficulty: 'medium',
    category: 'Social',
    timeEstimate: '5 min'
  },
  {
    task_type: 'win_mini_game',
    task_title: 'Win a Mini Game',
    task_description: 'Win any mini game in the games section',
    reward_coins: 50,
    difficulty: 'hard',
    category: 'Gaming',
    timeEstimate: '20 min'
  },
  {
    task_type: 'weekly_challenge',
    task_title: 'Weekly Challenge',
    task_description: 'Complete all daily tasks for 7 consecutive days',
    reward_coins: 500,
    difficulty: 'hard',
    category: 'Weekly',
    timeEstimate: '7 days'
  }
];

export const TasksSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData, refetch } = useUserData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const getVipMultiplier = (coins: number) => {
    if (coins >= 3000) return 10; // Grand Master
    if (coins >= 2000) return 5;  // Elite Master
    if (coins >= 1000) return 2;  // VIP
    return 1; // Regular
  };

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createDailyTasks = async () => {
    if (!user) return;

    try {
      // Check if daily tasks already exist for today
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (existingTasks && existingTasks.length > 0) return;

      // Create daily tasks
      const dailyTasks = taskTemplates.filter(template => 
        template.category === 'Daily' || template.task_type === 'watch_videos' || template.task_type === 'complete_spins'
      );

      const tasksToInsert = dailyTasks.map(template => ({
        user_id: user.id,
        task_type: template.task_type,
        task_title: template.task_title,
        task_description: template.task_description,
        reward_coins: template.reward_coins,
        status: 'pending'
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error creating daily tasks:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('complete_task', {
        task_uuid: taskId
      });

      if (error) throw error;

      if (data) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const multiplier = getVipMultiplier(userData?.coins || 0);
          const finalReward = task.reward_coins * multiplier;
          
          toast({
            title: '🎉 Task Completed!',
            description: `You earned ${finalReward} coins for completing "${task.task_title}"${multiplier > 1 ? ` (${multiplier}x VIP bonus!)` : ''}`,
          });
        }
        
        await fetchTasks();
        await refetch();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      createDailyTasks();
      fetchTasks();
    }
  }, [user]);

  const getDifficultyColor = (template: TaskTemplate) => {
    switch (template.difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (template: TaskTemplate) => {
    switch (template.category) {
      case 'Daily': return 'bg-blue-500';
      case 'Entertainment': return 'bg-purple-500';
      case 'Gaming': return 'bg-orange-500';
      case 'Social': return 'bg-pink-500';
      case 'Weekly': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskTemplate = (taskType: string) => {
    return taskTemplates.find(template => template.task_type === taskType);
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalRewards = tasks.filter(task => task.status === 'completed').reduce((sum, task) => {
    const multiplier = getVipMultiplier(userData?.coins || 0);
    return sum + (task.reward_coins * multiplier);
  }, 0);

  const vipMultiplier = getVipMultiplier(userData?.coins || 0);

  return (
    <div className="space-y-6">
      {/* VIP Status Banner */}
      {vipMultiplier > 1 && (
        <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl p-4 border border-yellow-400/50">
          <div className="text-center">
            <p className="text-yellow-300 font-bold animate-pulse">🎉 VIP BENEFITS ACTIVE! 🎉</p>
            <p className="text-white/90">All task rewards have {vipMultiplier}x multiplier!</p>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white text-xl font-bold mb-4">📊 Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{completedTasks}/{tasks.length}</div>
            <div className="text-white/80 text-sm">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalRewards}</div>
            <div className="text-white/80 text-sm">Coins Earned Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </div>
            <div className="text-white/80 text-sm">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const template = getTaskTemplate(task.task_type);
          if (!template) return null;

          const finalReward = task.reward_coins * vipMultiplier;

          return (
            <div key={task.id} className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border-l-4 ${task.status === 'completed' ? 'border-green-500' : 'border-white/30'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className={`font-semibold ${task.status === 'completed' ? 'text-green-400' : 'text-white'}`}>
                      {task.task_title}
                    </h4>
                    {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3">{task.task_description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getCategoryColor(template)} text-white text-xs`}>
                      {template.category}
                    </Badge>
                    <Badge className={`${getDifficultyColor(template)} text-white text-xs`}>
                      {template.difficulty}
                    </Badge>
                    <div className="flex items-center text-white/60 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {template.timeEstimate}
                    </div>
                    <div className="flex items-center text-yellow-400 text-xs font-semibold">
                      <Gift className="w-3 h-3 mr-1" />
                      {finalReward} coins
                      {vipMultiplier > 1 && (
                        <span className="ml-1 text-xs bg-yellow-500 text-white px-1 py-0.5 rounded">
                          {vipMultiplier}x
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {task.status === 'completed' ? (
                    <Button disabled className="bg-green-600 text-white opacity-75">
                      ✅ Completed
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => completeTask(task.id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      {loading ? '⏳ Processing...' : 'Complete Task'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
