
-- Add full-text search support and audit logging
-- 1. Add search_doc tsvector column for full-text search
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS search_doc tsvector;

-- 2. Create index for full-text search performance
CREATE INDEX IF NOT EXISTS articles_search_idx ON public.articles USING gin(search_doc);

-- 3. Create function to update search_doc automatically
CREATE OR REPLACE FUNCTION public.update_article_search_doc()
RETURNS trigger AS $$
BEGIN
  NEW.search_doc := to_tsvector('dutch', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.content, '') || ' ' || 
    COALESCE(NEW.excerpt, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically update search_doc
DROP TRIGGER IF EXISTS update_articles_search_doc ON public.articles;
CREATE TRIGGER update_articles_search_doc
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_article_search_doc();

-- 5. Create secure RPC for article creation with server-side validation
CREATE OR REPLACE FUNCTION public.create_article_secure(input jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  article_id uuid;
  result jsonb;
  input_title text;
  input_content text;
  input_excerpt text;
  input_category_id uuid;
  input_keywords text[];
  input_featured boolean;
BEGIN
  -- Extract and validate input
  input_title := trim(input->>'title');
  input_content := trim(input->>'content');
  input_excerpt := trim(COALESCE(input->>'excerpt', ''));
  input_category_id := (input->>'category_id')::uuid;
  input_keywords := COALESCE(ARRAY(SELECT jsonb_array_elements_text(input->'keywords')), ARRAY[]::text[]);
  input_featured := COALESCE((input->>'featured')::boolean, false);

  -- Server-side validation
  IF input_title IS NULL OR length(input_title) < 3 THEN
    RETURN jsonb_build_object('error', 'Title must be at least 3 characters long');
  END IF;
  
  IF length(input_title) > 200 THEN
    RETURN jsonb_build_object('error', 'Title cannot exceed 200 characters');
  END IF;
  
  IF input_content IS NULL OR length(input_content) < 10 THEN
    RETURN jsonb_build_object('error', 'Content must be at least 10 characters long');
  END IF;
  
  IF length(input_content) > 50000 THEN
    RETURN jsonb_build_object('error', 'Content cannot exceed 50,000 characters');
  END IF;
  
  IF input_excerpt IS NOT NULL AND length(input_excerpt) > 500 THEN
    RETURN jsonb_build_object('error', 'Excerpt cannot exceed 500 characters');
  END IF;
  
  IF input_category_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Category is required');
  END IF;
  
  IF array_length(input_keywords, 1) > 10 THEN
    RETURN jsonb_build_object('error', 'Maximum 10 keywords allowed');
  END IF;

  -- Check if category exists
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = input_category_id) THEN
    RETURN jsonb_build_object('error', 'Invalid category selected');
  END IF;

  -- Insert article
  INSERT INTO public.articles (
    title,
    content,
    excerpt,
    category_id,
    keywords,
    featured,
    author_id,
    status
  ) VALUES (
    input_title,
    input_content,
    NULLIF(input_excerpt, ''),
    input_category_id,
    input_keywords,
    input_featured,
    auth.uid(),
    'Concept'
  ) RETURNING id INTO article_id;

  -- Log the action
  INSERT INTO public.user_audit_log (
    action,
    target_user_id,
    performed_by,
    details
  ) VALUES (
    'article_create',
    auth.uid(),
    auth.uid(),
    jsonb_build_object(
      'article_id', article_id,
      'title', input_title,
      'status', 'Concept'
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'article_id', article_id,
    'message', 'Article created successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- 6. Create secure RPC for publishing articles
CREATE OR REPLACE FUNCTION public.publish_article_secure(article_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  article_record record;
  current_user_role text;
BEGIN
  -- Get current user role
  SELECT role INTO current_user_role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;

  -- Get article details
  SELECT * INTO article_record 
  FROM public.articles 
  WHERE id = article_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Article not found');
  END IF;

  -- Check permissions: must be author OR manager/admin
  IF article_record.author_id != auth.uid() AND 
     current_user_role NOT IN ('manager', 'admin') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions to publish this article');
  END IF;

  -- Update article status
  UPDATE public.articles 
  SET 
    status = 'Gepubliceerd',
    updated_at = now()
  WHERE id = article_id;

  -- Log the action
  INSERT INTO public.user_audit_log (
    action,
    target_user_id,
    performed_by,
    details
  ) VALUES (
    'article_publish',
    article_record.author_id,
    auth.uid(),
    jsonb_build_object(
      'article_id', article_id,
      'title', article_record.title
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Article published successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- 7. Create atomic view increment function
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.articles 
  SET views = COALESCE(views, 0) + 1
  WHERE id = article_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Article not found');
  END IF;
  
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- 8. Create optimized view for public articles
CREATE OR REPLACE VIEW public.articles_public AS
SELECT 
  a.id,
  a.title,
  a.excerpt,
  a.content,
  a.featured,
  a.views,
  a.keywords,
  a.created_at,
  a.updated_at,
  c.name as category_name,
  p.first_name || ' ' || COALESCE(p.last_name, '') as author_name
FROM public.articles a
LEFT JOIN public.categories c ON a.category_id = c.id
LEFT JOIN public.profiles p ON a.author_id = p.id
WHERE a.status = 'Gepubliceerd';

-- 9. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS articles_status_idx ON public.articles(status);
CREATE INDEX IF NOT EXISTS articles_category_id_idx ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS articles_author_id_idx ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON public.articles(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON public.articles(created_at DESC);

-- 10. Update existing articles to have search_doc populated
UPDATE public.articles 
SET search_doc = to_tsvector('dutch', 
  COALESCE(title, '') || ' ' || 
  COALESCE(content, '') || ' ' || 
  COALESCE(excerpt, '')
)
WHERE search_doc IS NULL;
