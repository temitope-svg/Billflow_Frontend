-- Run once in Supabase SQL editor for web public document sharing
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS public_slug text UNIQUE;

CREATE INDEX IF NOT EXISTS documents_public_slug_idx ON documents (public_slug) WHERE is_public = true;

-- Allow anonymous read of public documents
CREATE POLICY IF NOT EXISTS "Public documents are viewable by anyone"
  ON documents FOR SELECT
  USING (is_public = true);

CREATE POLICY IF NOT EXISTS "Public document children viewable"
  ON document_sender FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_sender.document_id AND d.is_public = true
  ));

CREATE POLICY IF NOT EXISTS "Public recipient viewable"
  ON document_recipient FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_recipient.document_id AND d.is_public = true
  ));

CREATE POLICY IF NOT EXISTS "Public line items viewable"
  ON line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = line_items.document_id AND d.is_public = true
  ));

CREATE POLICY IF NOT EXISTS "Public bank details viewable"
  ON bank_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = bank_details.document_id AND d.is_public = true
  ));
