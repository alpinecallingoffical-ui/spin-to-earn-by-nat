
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { EmailService } from '@/services/emailService';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    serviceId: '',
    templateId: '',
    publicKey: ''
  });

  const handleSave = () => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      toast({
        title: 'Missing Configuration',
        description: 'Please fill in all EmailJS configuration fields.',
        variant: 'destructive'
      });
      return;
    }

    EmailService.configure(config.serviceId, config.templateId, config.publicKey);
    
    // Store in localStorage for persistence
    localStorage.setItem('emailjs_config', JSON.stringify(config));
    
    toast({
      title: '✅ EmailJS Configured',
      description: 'Email notifications are now enabled!',
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">📧 Configure EmailJS</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Service ID</label>
            <Input
              placeholder="your_service_id"
              value={config.serviceId}
              onChange={(e) => setConfig({...config, serviceId: e.target.value})}
              className="bg-white/20 border-white/30 text-white placeholder-white/70"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Template ID</label>
            <Input
              placeholder="withdrawal_approval"
              value={config.templateId}
              onChange={(e) => setConfig({...config, templateId: e.target.value})}
              className="bg-white/20 border-white/30 text-white placeholder-white/70"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Public Key</label>
            <Input
              placeholder="your_public_key"
              value={config.publicKey}
              onChange={(e) => setConfig({...config, publicKey: e.target.value})}
              className="bg-white/20 border-white/30 text-white placeholder-white/70"
            />
          </div>

          <div className="bg-white/20 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📋 Setup Instructions:</h4>
            <ol className="text-sm space-y-1 text-white/80">
              <li>1. Go to <a href="https://emailjs.com" target="_blank" className="underline">emailjs.com</a> and create account</li>
              <li>2. Create an email service (Gmail, Outlook, etc.)</li>
              <li>3. Create email template with variables: to_email, to_name, withdrawal_amount, rupee_amount, esewa_number, date</li>
              <li>4. Get your Service ID, Template ID, and Public Key</li>
            </ol>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
          >
            💾 Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
