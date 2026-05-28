import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function stripHtml(html: string) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '');
}

export function getPreviewText(content: string | null | undefined): string {
    if (!content) return "";
    
    const trimmed = content.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
            const blocks = JSON.parse(trimmed);
            if (Array.isArray(blocks)) {
                const text = blocks
                    .map(block => {
                        if (block.type === 'text' || block.type === 'heading' || block.type === 'icon-text') {
                            return block.content || "";
                        }
                        if (block.type === 'support-card') {
                            return `${block.title || ""} ${block.content || ""}`;
                        }
                        return "";
                    })
                    .filter(Boolean)
                    .join(" ");
                return stripHtml(text);
            }
        } catch (e) {
            // Ignore parse errors and fall through
        }
    }
    
    return stripHtml(content);
}
