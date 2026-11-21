/** Bullets for the "How to Use 2027 Election Dashboard" pop-up (same pop-up on /2027, Delegates, Senate and every locality page). */
const fmt = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export const E27_HOWTO_TITLE = "How to Use 2027 Election Dashboard";
export const E27_HOWTO_CLOSE = "Close how to use 2027 Election Dashboard";

export function e27HowtoBullets(asOf: string): string[] {
  return [
    "This dashboard shows the races on Virginia’s November 2027 ballot: the House of Delegates, the State Senate, and county boards and offices. It shows who holds each seat today and who has signed up to run.",
    `The information is as of ${fmt(asOf)}. It comes only from official state and county records, mainly the Virginia Department of Elections and each county’s own website. The “As of” date at the top of each page tells you how fresh it is.`,
    "Tap Virginia Delegates or Virginia Senate to see every district. Each square on the seat chart is one district. Its color shows who is in the race: blue for Democrat, red for Republican, gold when both parties have someone, gray for another party, and an empty dashed box when no one is on record. Tap a square to see that district’s details.",
    "Below the chart are four buttons: Republican Incumbent Challengers, Democrat Incumbent Challengers, Republican Challenger Gaps, and Democrat Challenger Gaps. The number on each button is how many seats are on that list. Tap one to see the list.",
    "A “gap” is a seat where the person in office has no one from another party signed up to run against them yet. The “R gaps” and “D gaps” numbers on the main page are the same counts. R and D mean the party of the person who holds the seat now.",
    "Tap a county to see its local races. The buttons at the top of a county page switch between its Board of Supervisors, School Board, and Constitutional Officers (such as the Sheriff and the Commonwealth’s Attorney). Each county tile on the main page shows how many of its seats have no challenger yet. School Board races have no party on the ballot, so those seats are simply counted as unchallenged. “Coming soon” means we have not added that place yet.",
    "We assume the person in office will run again unless an official record says otherwise. If they have not filed any 2027 paperwork yet, you will see a small “No 2027 filing yet” tag.",
    "“Challengers” are people who have registered a 2027 campaign committee with the state. That is an early step toward running, but it does not put them on the ballot. Official ballot lists are not posted yet.",
    "Tap “$ Finances” next to a name to see that person’s campaign money reports on the Virginia Department of Elections website. If there is no link, we could not find an official committee for that person, and we never guess.",
    "Use the search bar at the top to look for a name, a district, or a topic anywhere on the site. Results show up right under the box.",
    "The gold News box on the main dashboard page lists recent news stories about the 2027 elections. Tap a headline to read the story, or tap All 2027 Election Related News for the full list.",
    "On the Delegates and Senate pages, use Filter by county or city, just above the seat chart, to type or pick a county or city. The chart keeps every square and highlights the districts that include that place. A short list under the filter names each district. The four buttons then show counts for that place, labeled so you can still see the statewide totals. You can share the view; the address includes ?county= and the locality’s id (for example, loudoun).",
  ];
}
