-- Create bosses table
CREATE TABLE public.bosses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  company TEXT,
  photo_url TEXT,
  bio TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ratings table (anonymous ratings)
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id UUID REFERENCES public.bosses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  user_nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create comments table (anonymous comments)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id UUID REFERENCES public.bosses(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  user_nickname TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create boss_photos table
CREATE TABLE public.boss_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id UUID REFERENCES public.bosses(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  uploaded_by_nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create likes/dislikes tracking table
CREATE TABLE public.boss_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id UUID REFERENCES public.bosses(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')) NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(boss_id, session_id)
);

-- Enable RLS
ALTER TABLE public.bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Anyone can view bosses" ON public.bosses FOR SELECT USING (true);
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can view photos" ON public.boss_photos FOR SELECT USING (true);
CREATE POLICY "Anyone can view reactions" ON public.boss_reactions FOR SELECT USING (true);

-- Allow anonymous inserts (public posting)
CREATE POLICY "Anyone can add bosses" ON public.bosses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can rate bosses" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can comment" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can upload photos" ON public.boss_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can react" ON public.boss_reactions FOR INSERT WITH CHECK (true);

-- Allow updates (for reactions and comment votes)
CREATE POLICY "Anyone can update comments" ON public.comments FOR UPDATE USING (true);
CREATE POLICY "Anyone can update bosses" ON public.bosses FOR UPDATE USING (true);

-- Create function to update boss average rating
CREATE OR REPLACE FUNCTION update_boss_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.bosses
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.ratings
      WHERE boss_id = NEW.boss_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE boss_id = NEW.boss_id
    ),
    updated_at = now()
  WHERE id = NEW.boss_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rating updates
CREATE TRIGGER update_boss_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION update_boss_rating();

-- Create function to update boss reactions
CREATE OR REPLACE FUNCTION update_boss_reactions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.bosses
  SET 
    total_likes = (
      SELECT COUNT(*)
      FROM public.boss_reactions
      WHERE boss_id = NEW.boss_id AND reaction_type = 'like'
    ),
    total_dislikes = (
      SELECT COUNT(*)
      FROM public.boss_reactions
      WHERE boss_id = NEW.boss_id AND reaction_type = 'dislike'
    ),
    updated_at = now()
  WHERE id = NEW.boss_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic reaction updates
CREATE TRIGGER update_boss_reactions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.boss_reactions
FOR EACH ROW
EXECUTE FUNCTION update_boss_reactions();

-- Create indexes for better performance
CREATE INDEX idx_ratings_boss_id ON public.ratings(boss_id);
CREATE INDEX idx_comments_boss_id ON public.comments(boss_id);
CREATE INDEX idx_boss_photos_boss_id ON public.boss_photos(boss_id);
CREATE INDEX idx_boss_reactions_boss_id ON public.boss_reactions(boss_id);
CREATE INDEX idx_bosses_name ON public.bosses(name);
CREATE INDEX idx_bosses_company ON public.bosses(company);

-- Insert some sample data
INSERT INTO public.bosses (name, position, company, photo_url, bio) VALUES
('Michael Scott', 'Regional Manager', 'Dunder Mifflin', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Known for his unconventional management style and love of fun office activities.'),
('Miranda Priestly', 'Editor-in-Chief', 'Runway Magazine', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Demanding perfectionist with high standards and impeccable fashion sense.'),
('Tony Stark', 'CEO', 'Stark Industries', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Innovative leader with a genius mind and bold vision for the future.');