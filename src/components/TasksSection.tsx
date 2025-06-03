
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Gift } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  completed: boolean;
  timeEstimate: string;
}

export const TasksSection = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Daily Check-in',
      description: 'Log in to the app and claim your daily bonus',
      reward: 10,
      difficulty: 'easy',
      category: 'Daily',
      completed: false,
      timeEstimate: '1 min'
    },
    {
      id: '2',
      title: 'Watch 3 Videos',
      description: 'Watch 3 entertainment videos to earn coins',
      reward: 25,
      difficulty: 'easy',
      category: 'Entertainment',
      completed: false,
      timeEstimate: '15 min'
    },
    {
      id: '3',
      title: 'Complete 5 Spins',
      description: 'Use the spin wheel 5 times today',
      reward: 30,
      difficulty: 'medium',
      category: 'Gaming',
      completed: false,
      timeEstimate: '10 min'
    },
    {
      id: '4',
      title: 'Invite a Friend',
      description: 'Share your referral code and get a friend to join',
      reward: 100,
      difficulty: 'medium',
      category: 'Social',
      completed: false,
      timeEstimate: '5 min'
    },
    {
      id: '5',
      title: 'Win a Mini Game',
      description: 'Win any mini game in the games section',
      reward: 50,
      difficulty: 'hard',
      category: 'Gaming',
      completed: false,
      timeEstimate: '20 min'
    },
    {
      id: '6',
      title: 'Weekly Challenge',
      description: 'Complete all daily tasks for 7 consecutive days',
      reward: 500,
      difficulty: 'hard',
      category: 'Weekly',
      completed: false,
      timeEstimate: '7 days'
    }
  ]);

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: '🎉 Task Completed!',
        description: `You earned ${task.reward} coins for completing "${task.title}"`,
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Daily': return 'bg-blue-500';
      case 'Entertainment': return 'bg-purple-500';
      case 'Gaming': return 'bg-orange-500';
      case 'Social': return 'bg-pink-500';
      case 'Weekly': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalRewards = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.reward, 0);

  return (
    <div className="space-y-6">
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
            <div className="text-white/80 text-sm">Coins Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round((completedTasks / tasks.length) * 100)}%</div>
            <div className="text-white/80 text-sm">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border-l-4 ${task.completed ? 'border-green-500' : 'border-white/30'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className={`font-semibold ${task.completed ? 'text-green-400' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  {task.completed && <CheckCircle className="w-5 h-5 text-green-400" />}
                </div>
                
                <p className="text-white/80 text-sm mb-3">{task.description}</p>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getCategoryColor(task.category)} text-white text-xs`}>
                    {task.category}
                  </Badge>
                  <Badge className={`${getDifficultyColor(task.difficulty)} text-white text-xs`}>
                    {task.difficulty}
                  </Badge>
                  <div className="flex items-center text-white/60 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.timeEstimate}
                  </div>
                  <div className="flex items-center text-yellow-400 text-xs font-semibold">
                    <Gift className="w-3 h-3 mr-1" />
                    {task.reward} coins
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                {task.completed ? (
                  <Button disabled className="bg-green-600 text-white opacity-75">
                    ✅ Completed
                  </Button>
                ) : (
                  <Button 
                    onClick={() => completeTask(task.id)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    Complete Task
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
