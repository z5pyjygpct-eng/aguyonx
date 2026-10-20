import { createFileRoute } from "@tanstack/react-router";
import { DocPage, OpenQuestions } from "@/components/site/doc-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy (draft) · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <DocPage crumb="Privacy" titleA="Privacy" dek="What this website keeps track of, in plain words." draft>
      <p>This page describes how the site is built today. It is not a legal document.</p>
      <h2>No accounts, no sign-up</h2>
      <p>You don’t need an account to use anything here. The email sign-up box is not turned on yet, so it doesn’t collect anything.</p>
      <h2>Visit counts</h2>
      <p>The site uses Vercel Web Analytics to count visits to pages. We use it to see which pages people read.</p>
      <h2>Things saved on your own device</h2>
      <ul>
        <li>The FOIA letter desk saves your draft letter in your browser so you don’t lose it. It stays on your device. We never see it.</li>
        <li>“Save” buttons on stories keep your list in your browser, on your device.</li>
        <li>After an update, the site may note in your browser that it already reloaded once, so it doesn’t keep reloading.</li>
      </ul>
      <p>You can clear these any time by clearing this site’s data in your browser settings.</p>
      <h2>Where the site runs</h2>
      <p>The site is hosted on Vercel. Like any web host, Vercel handles the requests your browser makes.</p>
      <h2>Links to other sites</h2>
      <p>News links, meeting videos and official records open on other websites (county video players, YouTube, Vimeo, the state legislature, news outlets). Those sites have their own rules.</p>
      <h2>Donations</h2>
      <p>Donate buttons go to our GiveSendGo page. Giving happens on GiveSendGo, not on this site.</p>
      <OpenQuestions items={[
        "Confirm the Vercel Web Analytics settings (Vercel describes it as cookie-free; we have not verified that ourselves).",
        "The code includes a sign-in system (Better Auth) left from the site template. Is any sign-in turned on in production? If yes, this page needs a section on it.",
        "Which email address should people use for privacy questions?",
        "When the email sign-up goes live, add which service holds the addresses and how to unsubscribe.",
        "Does Scott want a lawyer to review this before launch?",
      ]} />
    </DocPage>
  ),
});
