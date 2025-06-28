
import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignee_id?: string;
  assignee_name?: string;
  completed_at?: string;
  comments?: string;
  order: number;
}

interface ArticleWorkflow {
  id: string;
  article_id: string;
  article_title: string;
  current_step: number;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name: string;
  steps: WorkflowStep[];
}

interface WorkflowManagementProps {
  articleId?: string;
  showAllWorkflows?: boolean;
}

const WorkflowManagement = ({ articleId, showAllWorkflows = false }: WorkflowManagementProps) => {
  const [workflows, setWorkflows] = useState<ArticleWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ArticleWorkflow | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isManager } = useAuth();

  useEffect(() => {
    loadWorkflows();
  }, [articleId, showAllWorkflows]);

  const loadWorkflows = async () => {
    // Mock data - in real implementation this would fetch from Supabase
    const mockWorkflows: ArticleWorkflow[] = [
      {
        id: '1',
        article_id: articleId || '123',
        article_title: 'React Best Practices Guide',
        current_step: 1,
        status: 'in_review',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        author_id: 'author1',
        author_name: 'Jan de Vries',
        steps: [
          {
            id: '1',
            name: 'Technische review',
            status: 'completed',
            assignee_id: 'reviewer1',
            assignee_name: 'Marie Jansen',
            completed_at: new Date(Date.now() - 7200000).toISOString(),
            comments: 'Goed artikel, enkele kleine verbeteringen toegepast.',
            order: 1
          },
          {
            id: '2',
            name: 'Redactionele review',
            status: 'in_progress',
            assignee_id: 'editor1',
            assignee_name: 'Piet Bakker',
            order: 2
          },
          {
            id: '3',
            name: 'Manager goedkeuring',
            status: 'pending',
            assignee_id: 'manager1',
            assignee_name: 'Lisa de Jong',
            order: 3
          }
        ]
      },
      {
        id: '2',
        article_id: '124',
        article_title: 'TypeScript Advanced Features',
        current_step: 0,
        status: 'approved',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        author_id: 'author2',
        author_name: 'Anna Visser',
        steps: [
          {
            id: '4',
            name: 'Technische review',
            status: 'completed',
            assignee_id: 'reviewer1',
            assignee_name: 'Marie Jansen',
            completed_at: new Date(Date.now() - 100800000).toISOString(),
            comments: 'Excellent technical content.',
            order: 1
          },
          {
            id: '5',
            name: 'Redactionele review',
            status: 'completed',
            assignee_id: 'editor1',
            assignee_name: 'Piet Bakker',
            completed_at: new Date(Date.now() - 90000000).toISOString(),
            comments: 'Great writing style, ready for publication.',
            order: 2
          }
        ]
      }
    ];

    if (articleId) {
      setWorkflows(mockWorkflows.filter(w => w.article_id === articleId));
    } else if (showAllWorkflows) {
      setWorkflows(mockWorkflows);
    }
  };

  const handleStepAction = async (workflowId: string, stepId: string, action: 'approve' | 'reject') => {
    if (!isManager) {
      toast({
        title: "Geen toegang",
        description: "Je hebt geen rechten om deze actie uit te voeren",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In real implementation, this would update the workflow in Supabase
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedSteps = workflow.steps.map(step => {
            if (step.id === stepId) {
              return {
                ...step,
                status: action === 'approve' ? 'completed' : 'rejected',
                completed_at: new Date().toISOString(),
                comments: reviewComment
              };
            }
            return step;
          });

          return {
            ...workflow,
            steps: updatedSteps,
            current_step: action === 'approve' ? workflow.current_step + 1 : workflow.current_step,
            status: action === 'approve' ? 
              (workflow.current_step >= workflow.steps.length - 1 ? 'approved' : 'in_review') : 
              'rejected',
            updated_at: new Date().toISOString()
          };
        }
        return workflow;
      }));

      setReviewComment('');
      
      toast({
        title: action === 'approve' ? "Stap goedgekeurd" : "Stap afgewezen",
        description: `De workflow stap is ${action === 'approve' ? 'goedgekeurd' : 'afgewezen'}`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het verwerken van de actie",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Concept</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">In Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-green-500 text-green-700">Goedgekeurd</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Afgewezen</Badge>;
      case 'published':
        return <Badge variant="default">Gepubliceerd</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const WorkflowCard = ({ workflow }: { workflow: ArticleWorkflow }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workflow.article_title}</CardTitle>
          {getStatusBadge(workflow.status)}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {workflow.author_name}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(workflow.created_at).toLocaleDateString('nl-NL')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 p-3 border rounded">
              <div className="flex items-center gap-3">
                {getStepStatusIcon(step.status)}
                <div>
                  <h4 className="font-medium">{step.name}</h4>
                  {step.assignee_name && (
                    <p className="text-sm text-gray-600">
                      Toegewezen aan: {step.assignee_name}
                    </p>
                  )}
                  {step.completed_at && (
                    <p className="text-xs text-gray-500">
                      Voltooid: {new Date(step.completed_at).toLocaleString('nl-NL')}
                    </p>
                  )}
                </div>
              </div>
              
              {index < workflow.steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400" />
              )}
              
              {step.status === 'in_progress' && isManager && step.assignee_id === user?.id && (
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStepAction(workflow.id, step.id, 'approve')}
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Goedkeuren
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStepAction(workflow.id, step.id, 'reject')}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Afwijzen
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {workflow.status === 'in_review' && isManager && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Voeg een opmerking toe..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}
        
        {workflow.steps.some(step => step.comments) && (
          <div className="mt-4">
            <h5 className="font-medium mb-2">Opmerkingen:</h5>
            {workflow.steps
              .filter(step => step.comments)
              .map(step => (
                <div key={step.id} className="bg-gray-50 p-3 rounded text-sm mb-2">
                  <strong>{step.name}:</strong> {step.comments}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          {showAllWorkflows ? 'Alle Workflows' : 'Workflow Status'}
        </h3>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <GitBranch className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Geen actieve workflows</p>
          </CardContent>
        </Card>
      ) : (
        workflows.map(workflow => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))
      )}
    </div>
  );
};

export default WorkflowManagement;
