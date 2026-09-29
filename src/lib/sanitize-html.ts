/** Remove executable HTML while preserving the site's basic rich text markup. */
export function sanitizeHtml(input: string | null | undefined): string {
    if (!input) return "";
    return input
        .replace(/<\/?(script|style|iframe|object|embed|form|base|meta|link)[^>]*>/gi, "")
        .replace(/\s(on[a-z]+|formaction|srcdoc)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(/\s(href|src|action)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "")
        .replace(/\s(href|src|action)\s*=\s*javascript:[^\s>]+/gi, "");
}
