import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReports } from '@/hooks/useReports';
import { AlertCircle, Upload, Search, X, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ReportSection: React.FC = () => {
  const { reports, loading, createReport, searchReportByTicketId } = useReports();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [images, setImages] = useState<File[]>([]);
  const [searchTicketId, setSearchTicketId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 5) {
        toast.error('You can upload a maximum of 5 images');
        return;
      }
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const result = await createReport(title, description, priority, images);
    
    if (result) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setImages([]);
    }
    setSubmitting(false);
  };

  const handleSearch = async () => {
    if (!searchTicketId.trim()) {
      toast.error('Please enter a ticket ID');
      return;
    }

    const result = await searchReportByTicketId(searchTicketId);
    if (result) {
      setSearchResult(result);
    } else {
      toast.error('Ticket not found');
      setSearchResult(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Submit Report Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Submit a Report
          </CardTitle>
          <CardDescription>
            Found an issue? Let us know and we'll help you resolve it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority *</label>
              <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue..."
                rows={4}
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Screenshots (Optional, max 5)
              </label>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={images.length >= 5}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images ({images.length}/5)
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search & My Reports */}
      <div className="space-y-6">
        {/* Search Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={searchTicketId}
                onChange={(e) => setSearchTicketId(e.target.value.toUpperCase())}
                placeholder="Enter Ticket ID (e.g., TKT-ABC123)"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {searchResult && (
              <div className="mt-4 p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(searchResult.status)}>
                    {getStatusIcon(searchResult.status)}
                    <span className="ml-1">{searchResult.status}</span>
                  </Badge>
                  <Badge className={getPriorityColor(searchResult.priority)}>
                    {searchResult.priority}
                  </Badge>
                </div>
                <h4 className="font-semibold">{searchResult.title}</h4>
                <p className="text-sm text-muted-foreground">{searchResult.description}</p>
                {searchResult.admin_response && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-sm font-medium">Admin Response:</p>
                    <p className="text-sm">{searchResult.admin_response}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Reports */}
        <Card>
          <CardHeader>
            <CardTitle>My Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : reports.length === 0 ? (
                <p className="text-center text-muted-foreground">No reports yet</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {report.ticket_id}
                        </code>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 text-xs">{report.status}</span>
                          </Badge>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm">{report.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>
                      {report.admin_response && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-xs font-medium">Admin Response:</p>
                          <p className="text-xs">{report.admin_response}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
