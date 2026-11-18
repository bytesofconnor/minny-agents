export const DEMO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{4,16}$/;

export function isDemoSlug(value: string) {
  return DEMO_SLUG.test(value);
}
