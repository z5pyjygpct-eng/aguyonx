export type Book = {
  slug: string;
  title: string;
  subtitle: string;
  dek: string;
  href: string;
  image: string;
  imageAlt: string;
};

/** Public titles only. No prices. Amazon is the door. Add a row when the next book exists. */
export const BOOKS: Book[] = [
  {
    slug: "grassroots-intelligence",
    title: "Grassroots Intelligence",
    subtitle: "The New Age of Citizen Political Research",
    dek: "How a citizen uses the public record: FOIA, filings, and the trail that is already there.",
    href: "https://www.amazon.com/Grassroots-Intelligence-Citizen-Political-Research-ebook/dp/B0GJ7NLQ2W",
    image: "/images/books/grassroots-intelligence.jpg",
    imageAlt: "Cover of Grassroots Intelligence: The New Age of Citizen Political Research",
  },
  {
    slug: "accountability-laundering",
    title: "Accountability Laundering",
    subtitle: "When No One Is Responsible",
    dek: "How responsibility disappears in Virginia government, and how to see it in the record.",
    href: "https://www.amazon.com/ACCOUNTABILITY-LAUNDERING-When-One-Responsible-ebook/dp/B0H3ZCCHKY",
    image: "/images/books/accountability-laundering.jpg",
    imageAlt: "Cover of Accountability Laundering: When No One Is Responsible",
  },
];
