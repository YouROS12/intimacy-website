/**
 * Shared utility for translating product category labels.
 * Eliminates duplicate getCategoryLabel functions across 4 components.
 */
export function getCategoryLabel(
    cat: string,
    t: (key: string) => string
): string {
    const key = `shop.categories.${cat}`;
    const translated = t(key);
    // If the translation returns the key itself, it means no translation exists — fall back to raw category
    return translated !== key ? translated : cat;
}
