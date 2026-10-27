export const CONTACT_SUBMIT_EVENT = "contact_submit" as const;

const PAGE_PATH = /^\/[A-Za-z0-9/-]*$/;

type PagePath = string & { readonly __brand: "PagePath" };

type ContactPiiKey =
  | "name"
  | "email"
  | "business"
  | "message"
  | "phone"
  | "website";

type ContactSubmitEvent = {
  readonly path: PagePath;
};

type TrackContactSubmit = ContactSubmitEvent & {
  readonly [K in ContactPiiKey]?: never;
};

type Expect<T extends true> = T;

type _eventName = Expect<(typeof CONTACT_SUBMIT_EVENT) extends "contact_submit" ? true : false>;

type _contactSubmitEventHasNoPii = Expect<
  [keyof ContactSubmitEvent & ContactPiiKey] extends [never] ? true : false
>;

type _contactSubmitRejectsPiiValue = Expect<
  [{ readonly path: PagePath } & Record<ContactPiiKey, string>] extends [TrackContactSubmit] ? false : true
>;

export type ContactSubmitWitness =
  _eventName & _contactSubmitEventHasNoPii & _contactSubmitRejectsPiiValue;

function isPagePath(value: string): value is PagePath {
  return PAGE_PATH.test(value);
}

export function contactSubmitProps(pathname: string): TrackContactSubmit | null {
  if (!isPagePath(pathname)) return null;
  return { path: pathname };
}
