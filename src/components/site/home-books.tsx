import { BOOKS } from "@/content/books";
import { Kicker } from "@/components/site/kicker";

export function HomeBooks() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Kicker>Books</Kicker>
        <h2 className="mt-2 font-serif text-3xl font-medium">From the desk</h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-2">
          {BOOKS.map((book) => (
            <li key={book.slug}>
              <a
                href={book.href}
                target="_blank"
                rel="noreferrer"
                className="group grid gap-5 sm:grid-cols-[8rem_1fr] sm:items-start"
              >
                <img
                  src={book.image}
                  alt={book.imageAlt}
                  className="aspect-[2/3] w-32 object-cover outline outline-1 -outline-offset-1 outline-foreground/10 sm:w-full"
                />
                <div>
                  <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    Book
                  </p>
                  <h3 className="mt-2 font-serif text-2xl font-medium group-hover:underline">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm italic text-muted-foreground">{book.subtitle}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{book.dek}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
