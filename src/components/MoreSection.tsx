
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TasksSection } from './TasksSection';
import { VideosSection } from './VideosSection';
import { GamesSection } from './GamesSection';

export const MoreSection = () => {
  const [activeMoreTab, setActiveMoreTab] = useState('tasks');

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
      <h2 className="text-white text-3xl font-bold mb-6 text-center">🎮 MORES - Entertainment Hub</h2>
      
      <Tabs value={activeMoreTab} onValueChange={setActiveMoreTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm mb-6">
          <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-white/30">
            ✅ Tasks
          </TabsTrigger>
          <TabsTrigger value="videos" className="text-white data-[state=active]:bg-white/30">
            📺 Videos
          </TabsTrigger>
          <TabsTrigger value="games" className="text-white data-[state=active]:bg-white/30">
            🎮 Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <TasksSection />
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <VideosSection />
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <GamesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
