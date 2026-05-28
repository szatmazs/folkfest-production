'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo, Strikethrough, Underline as UnderlineIcon } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string; // Additional classes for the container
}

const MenuButton = ({ onClick, isActive, children }: { onClick: () => void; isActive?: boolean; children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-600'}`}
    >
        {children}
    </button>
);

export function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false, // Fix for React 18 hydration
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
            <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                    <Bold className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                    <Italic className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
                    <UnderlineIcon className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                    <Strikethrough className="w-4 h-4" />
                </MenuButton>
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <List className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <ListOrdered className="w-4 h-4" />
                </MenuButton>
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
                    <LinkIcon className="w-4 h-4" />
                </MenuButton>
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <MenuButton onClick={() => editor.chain().focus().undo().run()}>
                    <Undo className="w-4 h-4" />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()}>
                    <Redo className="w-4 h-4" />
                </MenuButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
