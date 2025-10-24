import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: 'user' | 'admin') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Choose Your Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Dashboard */}
          <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">User Dashboard</CardTitle>
              <CardDescription>
                Access your personal dashboard with all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectRole('user')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                Enter as User
              </Button>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Spin the wheel & earn coins</li>
                <li>• Play games & watch videos</li>
                <li>• Chat with other users</li>
                <li>• Submit reports & track tickets</li>
                <li>• Manage your profile & rewards</li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Admin Panel</CardTitle>
              <CardDescription>
                Manage users, reports, and platform settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectRole('admin')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                Enter as Admin
              </Button>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Manage all users & permissions</li>
                <li>• Review & respond to reports</li>
                <li>• Process withdrawal requests</li>
                <li>• Monitor platform statistics</li>
                <li>• Control system settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
