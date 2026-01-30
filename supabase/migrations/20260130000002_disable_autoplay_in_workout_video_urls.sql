UPDATE public.workouts
SET video_url = CASE
  WHEN video_url ~* '^https://player\.mediadelivery\.net/embed/' THEN
    CASE
      WHEN video_url ~* '([?&])autoplay=' THEN regexp_replace(video_url, '([?&])autoplay=[^&]*', E'\\1autoplay=false', 'gi')
      WHEN position('?' in video_url) > 0 THEN video_url || '&autoplay=false'
      ELSE video_url || '?autoplay=false'
    END
  ELSE video_url
END
WHERE video_url IS NOT NULL
  AND video_url <> ''
  AND video_url ~* '^https://player\.mediadelivery\.net/embed/';
