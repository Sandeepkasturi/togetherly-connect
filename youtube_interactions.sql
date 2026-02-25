CREATE TABLE IF NOT EXISTS public.youtube_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('subscribe', 'like', 'view')),
    channel_id TEXT,
    channel_title TEXT,
    video_id TEXT,
    video_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, interaction_type, channel_id, video_id) -- Prevent duplicate likes/subs per user
);

-- Enable RLS
ALTER TABLE public.youtube_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own interactions"
    ON public.youtube_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
    ON public.youtube_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
    ON public.youtube_interactions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
    ON public.youtube_interactions FOR UPDATE
    USING (auth.uid() = user_id);
    
-- Create index for faster queries on user's profile
CREATE INDEX idx_youtube_interactions_user_type_created
ON public.youtube_interactions (user_id, interaction_type, created_at DESC);
