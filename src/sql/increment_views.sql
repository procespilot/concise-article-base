
-- Function to safely increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles 
  SET views = views + 1 
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
