import { collectionTypes } from "./collections";
import { objectTypes } from "./objects";
import { singletonTypes } from "./pages";

export const schemaTypes = [...singletonTypes, ...collectionTypes, ...objectTypes];

/* Singletons live at a fixed document ID equal to their type name, so the
   site can fetch them by ID and the studio can open them directly. */
export const SINGLETONS: string[] = singletonTypes.map((t) => t.name);
