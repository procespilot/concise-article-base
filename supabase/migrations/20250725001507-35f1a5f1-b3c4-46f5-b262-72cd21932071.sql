-- Update articles table to support block-based content structure
ALTER TABLE public.articles 
ADD COLUMN blocks JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance on blocks content
CREATE INDEX idx_articles_blocks_gin ON public.articles USING GIN(blocks);

-- Add version tracking for undo/redo functionality
ALTER TABLE public.articles 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Create table for article version history
CREATE TABLE public.article_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  content TEXT, -- Keep for backward compatibility
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on article_versions
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for article_versions
CREATE POLICY "Users can view article versions they have access to" 
ON public.article_versions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.articles 
    WHERE id = article_versions.article_id 
    AND (auth.uid() = user_id OR auth.uid() = created_by)
  )
);

CREATE POLICY "Users can create article versions for their articles" 
ON public.article_versions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.articles 
    WHERE id = article_versions.article_id 
    AND auth.uid() = user_id
  )
);

-- Create function to automatically save version when article is updated
CREATE OR REPLACE FUNCTION save_article_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Save the old version before updating
  IF TG_OP = 'UPDATE' AND (OLD.blocks IS DISTINCT FROM NEW.blocks OR OLD.content IS DISTINCT FROM NEW.content) THEN
    INSERT INTO public.article_versions (article_id, version, blocks, content, created_by)
    VALUES (OLD.id, OLD.version, OLD.blocks, OLD.content, auth.uid());
    
    -- Increment version for the updated article
    NEW.version = OLD.version + 1;
    NEW.updated_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic version saving
CREATE TRIGGER save_article_version_trigger
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION save_article_version();

-- Create function to get article history
CREATE OR REPLACE FUNCTION get_article_history(article_uuid UUID)
RETURNS TABLE (
  version INTEGER,
  blocks JSONB,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT av.version, av.blocks, av.content, av.created_at, av.created_by
  FROM public.article_versions av
  WHERE av.article_id = article_uuid
  ORDER BY av.version DESC;
END;
$$ LANGUAGE plpgsql;