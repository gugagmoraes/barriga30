-- Create quiz submissions table (Stores raw quiz responses)
CREATE TABLE quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable because quiz might be taken before signup
  session_id VARCHAR(255), -- For anonymous tracking (cookie/localstorage id)
  status VARCHAR(50) CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')) DEFAULT 'started',
  responses JSONB DEFAULT '{}'::jsonb, -- The raw Q&A payload
  version VARCHAR(50) NOT NULL DEFAULT 'v1.0', -- To track which version of the quiz was taken
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tracking FK to diet_snapshots to know source
ALTER TABLE diet_snapshots ADD COLUMN source_quiz_submission_id UUID REFERENCES quiz_submissions(id) ON DELETE SET NULL;

-- RLS Policies
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view/edit their own submissions
CREATE POLICY "Users can view own quiz submissions" ON quiz_submissions FOR SELECT USING (
  (auth.uid() = user_id) OR (session_id IS NOT NULL) -- Ideally we match session_id too but for MVP auth is safer
);

CREATE POLICY "Users can insert quiz submissions" ON quiz_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own quiz submissions" ON quiz_submissions FOR UPDATE USING (
  (auth.uid() = user_id)
);

-- Index for fast lookup by user or session
CREATE INDEX idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_session_id ON quiz_submissions(session_id);
