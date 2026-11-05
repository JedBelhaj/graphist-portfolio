/* The shape of data/upwork/upwork.json: what parse.ts writes and import.ts
   reads. Anything the parser couldn't find is null, never a guess. */

/* An image on the Upwork page: its original URL and, if the saved page's
   _files folder has it, that copy (relative to data/upwork/). Only local
   copies are uploaded; nothing is downloaded. */
export type ParsedImage = { url: string | null; file: string | null };

export type ParsedReview = {
  /* Stable across re-parses: a hash of the review text and project title. */
  key: string;
  clientName: string | null;
  projectTitle: string | null;
  rating: number | null;
  text: string;
  /* YYYY-MM-DD, the job's end date. */
  date: string | null;
  dateRange: string | null;
  earnings: string | null;
  hourlyRate: string | null;
  sourceFile: string;
  via: "state" | "dom";
};

export type ParsedPortfolioItem = {
  title: string;
  slug: string;
  /* Plain text, paragraphs separated by blank lines. */
  description: string | null;
  role: string | null;
  skills: string[];
  coverImage: ParsedImage | null;
  gallery: ParsedImage[];
  videoUrl: string | null;
  projectUrl: string | null;
  sourceFile: string;
  via: "state" | "dom";
};

export type UpworkData = {
  parsedAt: string;
  files: string[];
  reviews: ParsedReview[];
  portfolio: ParsedPortfolioItem[];
  /* Everything the parser skipped or couldn't read, per file. */
  problems: { file: string; message: string }[];
};
