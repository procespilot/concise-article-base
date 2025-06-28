
import React, { useState, useEffect } from 'react';
import { MessageCircle, Reply, Edit, Trash2, Send, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  article_id: string;
  replies?: Comment[];
}

interface CommentSystemProps {
  articleId: string;
}

const CommentSystem = ({ articleId }: CommentSystemProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    // Simulate loading comments - in real implementation this would fetch from Supabase
    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'Great article! Very informative.',
        author_name: 'Jan de Vries',
        author_id: 'user1',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        article_id: articleId,
        replies: [
          {
            id: '2',
            content: 'I agree, especially the section about best practices.',
            author_name: 'Marie Jansen',
            author_id: 'user2',
            created_at: new Date(Date.now() - 43200000).toISOString(),
            updated_at: new Date(Date.now() - 43200000).toISOString(),
            parent_id: '1',
            article_id: articleId
          }
        ]
      }
    ];
    setComments(mockComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      // In real implementation, this would save to Supabase
      const comment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author_name: `${user.first_name} ${user.last_name}`,
        author_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        article_id: articleId
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      toast({
        title: "Reactie geplaatst",
        description: "Je reactie is succesvol toegevoegd"
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het plaatsen van je reactie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    setLoading(true);
    try {
      const reply: Comment = {
        id: Date.now().toString(),
        content: replyContent,
        author_name: `${user.first_name} ${user.last_name}`,
        author_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_id: parentId,
        article_id: articleId
      };

      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));

      setReplyTo(null);
      setReplyContent('');
      
      toast({
        title: "Reactie geplaatst",
        description: "Je reactie is succesvol toegevoegd"
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het plaatsen van je reactie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{comment.author_name}</p>
              <p className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('nl-NL')}
              </p>
            </div>
          </div>
          
          {user?.id === comment.author_id && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {editingComment === comment.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditingComment(null)}>
                Opslaan
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setEditingComment(null)}
              >
                Annuleren
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm mb-3">{comment.content}</p>
            
            {!isReply && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(comment.id)}
                className="text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reageren
              </Button>
            )}
            
            {replyTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Schrijf je reactie..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleReply(comment.id)}
                    disabled={loading || !replyContent.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Plaatsen
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <Card className="mt-6">
        <CardContent className="text-center py-8">
          <MessageCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Log in om reacties te bekijken en te plaatsen</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Reacties ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <Textarea
            placeholder="Schrijf je reactie..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] mb-3"
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Reactie plaatsen
          </Button>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Nog geen reacties. Wees de eerste!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSystem;
