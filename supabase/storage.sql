INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('platform-media','platform-media',false,25000000,ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm','audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/ogg','application/pdf'])
ON CONFLICT (id) DO UPDATE SET public=false,file_size_limit=25000000,allowed_mime_types=EXCLUDED.allowed_mime_types;
-- No public object policies: the server checks membership before serving media.
