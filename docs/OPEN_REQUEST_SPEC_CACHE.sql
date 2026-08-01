-- SparkMyName — open-request spec cache
-- Run once in the Supabase SQL Editor. Optional: without it the resolver still works,
-- it just pays the model for a spec it has already worked out before.
--
-- No ownership data lives here. It is a dictionary of dimensions, nothing more, so it is
-- keyed by the request slug alone and shared across every brand.

CREATE TABLE IF NOT EXISTS asset_specs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_slug   VARCHAR(64)  UNIQUE NOT NULL,
    label        VARCHAR(120),
    request_text TEXT,
    width        INT NOT NULL,
    height       INT NOT NULL,
    dpi          INT NOT NULL,
    bleed        INT DEFAULT 0,
    aspect       VARCHAR(10),
    size_tier    VARCHAR(4),
    layout_note  TEXT,
    source       VARCHAR(16),   -- 'known' | 'resolved' | 'fallback'
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service role writes it; nothing else reads it directly.
ALTER TABLE asset_specs ENABLE ROW LEVEL SECURITY;
