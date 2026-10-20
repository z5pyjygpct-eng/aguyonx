import { createFileRoute } from "@tanstack/react-router";
import { DocPage, OpenQuestions } from "@/components/site/doc-page";
import { FTM_TRANSCRIPTS } from "@/content/ftm-transcripts";

export const Route = createFileRoute("/how-we-work")({
  head: () => ({ meta: [{ title: "How we work (draft) · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const n = FTM_TRANSCRIPTS.length;
  return (
    <DocPage crumb="How we work" titleA="How we" titleB="work" dek="Where our information comes from, and how we check it." draft>
      <h2>Meeting videos</h2>
      <p>We link to the official meeting videos each board posts: county and city video players (Granicus, eScribe, Wistia), Loudoun schools on Vimeo, and the state House, Senate and Board of Education on YouTube. We don’t host the videos.</p>
      <h2>Transcripts</h2>
      <p>A computer turns the meeting audio into text. We use the open-source program whisper.cpp with the large-v3-turbo model. Right now {n.toLocaleString()} meetings have a transcript. Computers mishear words and names, so a transcript helps you find a moment. It is not a quote. Always check the video.</p>
      <h2>Votes</h2>
      <p>Votes come only from official records: county and city minutes and action reports (eScribe, Granicus, BoardDocs, Laserfiche) and the Virginia Legislative Information System roll calls. We never guess a vote from a video or a transcript. If minutes aren’t posted yet, the page says so.</p>
      <h2>News</h2>
      <p>The news list is headlines from other outlets, with links to the original story. We don’t copy the articles.</p>
      <h2>2027 candidates</h2>
      <p>Candidate lists come from VPAP, with the date we checked.</p>
      <h2>Our own reporting</h2>
      <p>Articles and investigations list their sources. If you can’t see where a number came from, we leave it out.</p>
      <h2>Mistakes</h2>
      <p>If we get something wrong, tell us and we’ll fix it.</p>
      <OpenQuestions items={[
        "How should readers report a correction (email address or form)?",
        "Should we name the machine that runs the transcription, or how often it runs?",
        "Do budget pages need their own section on sources?",
      ]} />
    </DocPage>
  );
}
