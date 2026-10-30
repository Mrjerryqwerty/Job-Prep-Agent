-- Which bank question each interview turn asked, so answers can be scored against its rubric.
alter table interview_turns add column if not exists qid text;
