
-- Crisis types enum
CREATE TYPE public.crisis_status AS ENUM ('detected', 'active', 'responding', 'recovering', 'resolved');
CREATE TYPE public.crisis_type AS ENUM ('pr', 'regulatory', 'operational');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.sentiment_type AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE public.signal_source AS ENUM ('twitter', 'news', 'blog', 'linkedin');
CREATE TYPE public.response_template_type AS ENUM ('holding', 'apology', 'clarification');
CREATE TYPE public.approval_status AS ENUM ('draft', 'pending_legal', 'pending_exec', 'approved', 'rejected', 'published');

-- 1. CRISES
CREATE TABLE public.crises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  risk_level risk_level NOT NULL DEFAULT 'medium',
  type crisis_type NOT NULL DEFAULT 'operational',
  status crisis_status NOT NULL DEFAULT 'detected',
  sentiment_score numeric DEFAULT 0,
  signal_count integer DEFAULT 0,
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view crises" ON public.crises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert crises" ON public.crises FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update crises" ON public.crises FOR UPDATE TO authenticated USING (true);

-- 2. SIGNALS
CREATE TABLE public.signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id uuid REFERENCES public.crises(id) ON DELETE CASCADE,
  source signal_source NOT NULL,
  author text NOT NULL,
  author_followers integer DEFAULT 0,
  content text NOT NULL,
  sentiment sentiment_type NOT NULL DEFAULT 'neutral',
  reach integer DEFAULT 0,
  keywords text[] DEFAULT '{}',
  is_influencer boolean DEFAULT false,
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view signals" ON public.signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert signals" ON public.signals FOR INSERT TO authenticated WITH CHECK (true);

-- 3. NARRATIVES
CREATE TABLE public.narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id uuid REFERENCES public.crises(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  sentiment sentiment_type NOT NULL DEFAULT 'neutral',
  risk_level risk_level NOT NULL DEFAULT 'medium',
  signal_count integer DEFAULT 0,
  top_keywords text[] DEFAULT '{}',
  trending boolean DEFAULT false,
  ai_generated boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view narratives" ON public.narratives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert narratives" ON public.narratives FOR INSERT TO authenticated WITH CHECK (true);

-- 4. RESPONSE TEMPLATES
CREATE TABLE public.response_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type response_template_type NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  channel text NOT NULL DEFAULT 'general',
  crisis_type crisis_type,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.response_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view templates" ON public.response_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert templates" ON public.response_templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated can update templates" ON public.response_templates FOR UPDATE TO authenticated USING (true);

-- 5. RESPONSE LOG
CREATE TABLE public.response_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id uuid REFERENCES public.crises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  channel text NOT NULL DEFAULT 'general',
  template_id uuid REFERENCES public.response_templates(id) ON DELETE SET NULL,
  approval_status approval_status NOT NULL DEFAULT 'draft',
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.response_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view response log" ON public.response_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own responses" ON public.response_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can update responses" ON public.response_log FOR UPDATE TO authenticated USING (true);

-- 6. WAR ROOM MESSAGES
CREATE TABLE public.war_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id uuid REFERENCES public.crises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  message_type text NOT NULL DEFAULT 'message',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.war_room_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view war room" ON public.war_room_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own messages" ON public.war_room_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 7. REPUTATION SNAPSHOTS
CREATE TABLE public.reputation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id uuid REFERENCES public.crises(id) ON DELETE CASCADE,
  sentiment_score numeric NOT NULL DEFAULT 0,
  positive_pct numeric DEFAULT 0,
  neutral_pct numeric DEFAULT 0,
  negative_pct numeric DEFAULT 0,
  share_of_voice numeric DEFAULT 0,
  reputation_score numeric DEFAULT 50,
  media_reach integer DEFAULT 0,
  signal_volume integer DEFAULT 0,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reputation_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view snapshots" ON public.reputation_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert snapshots" ON public.reputation_snapshots FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.war_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;

-- Auto-update updated_at triggers
CREATE TRIGGER update_crises_updated_at BEFORE UPDATE ON public.crises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.response_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
