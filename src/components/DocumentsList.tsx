import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiRequest';
import { DOCUMENT_TYPES, Document } from '@/types/lead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/mockAuth';
import { ExternalLink, Upload } from 'lucide-react';

interface DocumentsListProps {
  leadId: string;
}

export function DocumentsList({ leadId }: DocumentsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [docLink, setDocLink] = useState('');

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents', leadId],
    queryFn: () => apiRequest(`/api/documents?leadId=${leadId}`),
  });

  const upsertDocMutation = useMutation({
    mutationFn: (data: { documentType: string; link: string }) =>
      apiRequest('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          leadId,
          uploadedBy: currentUser?.id,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', leadId] });
      toast({ title: 'Document Updated', description: 'Document link saved successfully' });
      setEditingDoc(null);
      setDocLink('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update document', variant: 'destructive' });
    },
  });

  const handleSave = (documentType: string) => {
    if (!docLink.trim()) {
      toast({ title: 'Error', description: 'Please enter a valid link', variant: 'destructive' });
      return;
    }
    upsertDocMutation.mutate({ documentType, link: docLink });
  };

  const getDocument = (type: string) => documents.find((doc) => doc.documentType === type);

  return (
    <div className="space-y-4">
      {DOCUMENT_TYPES.map((docType) => {
        const existingDoc = getDocument(docType);
        const isEditing = editingDoc === docType;

        return (
          <Card key={docType}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{docType}</CardTitle>
                {existingDoc && <Badge variant="secondary">Uploaded</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter document link"
                    value={docLink}
                    onChange={(e) => setDocLink(e.target.value)}
                  />
                  <Button onClick={() => handleSave(docType)} disabled={upsertDocMutation.isPending}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => { setEditingDoc(null); setDocLink(''); }}>
                    Cancel
                  </Button>
                </div>
              ) : existingDoc ? (
                <div className="flex items-center justify-between">
                  <a
                    href={existingDoc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View Document <ExternalLink className="h-3 w-3" />
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingDoc(docType);
                      setDocLink(existingDoc.link);
                    }}
                  >
                    Update
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingDoc(docType)}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
