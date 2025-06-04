
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Camera, Upload } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentPictureUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPictureUrl,
  onUploadSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload a profile picture',
        variant: 'destructive',
      });
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update user profile with new picture URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onUploadSuccess(data.publicUrl);
      
      toast({
        title: '✅ Success!',
        description: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          {currentPictureUrl ? (
            <img 
              src={currentPictureUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>
        
        <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
          <div className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 text-white transition-colors">
            <Upload className="w-4 h-4" />
          </div>
        </label>
        
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={uploadProfilePicture}
          disabled={uploading}
          className="hidden"
        />
      </div>
      
      {uploading && (
        <p className="text-white/80 text-sm">Uploading...</p>
      )}
    </div>
  );
};
