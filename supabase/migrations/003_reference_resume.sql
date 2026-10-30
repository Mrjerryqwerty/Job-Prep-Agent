-- The app now uses one fixed reference resume for everyone, so it no longer belongs to a candidate.
alter table resumes alter column candidate_id drop not null;
