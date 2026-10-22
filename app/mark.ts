/** Shared Minny Agents mark geometry. Bold 4-point north star over one lake wave. */
export const MARK_VIEWBOX = "0 0 32 32";
export const INK = "#060A1A";
export const TEAL = "#3CDBC0";

/** Filled 4-point star — thick waist so it holds at 16px. */
export const STAR_D =
  "M16 1.8L20.6 8.9L28.2 13L20.6 17.1L16 24.2L11.4 17.1L3.8 13L11.4 8.9Z";

/** Filled wave ribbon under the star (Satori-safe, no stroke). */
export const WAVE_D =
  "M3.6 25.1C9.4 21.8 13.2 28.6 19.4 25.2C23.2 23.1 25.6 27 28.4 25.3L28.4 27.9C25.6 29.6 23.2 25.7 19.4 27.8C13.2 31.2 9.4 24.4 3.6 27.7Z";

/** Star-only mark for 16/32px tabs — same north star, ~19% inset so it does not clip. */
export const FAVICON_STAR_D =
  "M16 6.2L20.2 12.8L26 16L20.2 19.2L16 25.8L11.8 19.2L6 16L11.8 12.8Z";

/** Smaller star for apple/manifest icons, with room for a single wave. */
export const FAVICON_MARK_STAR_D =
  "M16 6.6L19.4 11.8L25 14.4L19.4 17L16 22.2L12.6 17L7 14.4L12.6 11.8Z";

/** One simple wave under the smaller star. Clear gap; 19% bottom inset. */
export const FAVICON_MARK_WAVE_D =
  "M7.2 23.6C10.6 21.8 13.2 25.4 16 23.6C18.8 21.8 21.4 25.4 24.8 23.6L24.8 25.8C21.4 27.6 18.8 24 16 25.8C13.2 27.6 10.6 24 7.2 25.8Z";
