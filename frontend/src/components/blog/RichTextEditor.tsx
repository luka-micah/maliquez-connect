import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  FiBold, FiItalic, FiUnderline, FiSlash, FiList, FiHash,
  FiCode, FiMessageSquare, FiLink2, FiType, FiRotateCcw, FiRotateCw,
} from 'react-icons/fi';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  icon: React.ReactNode;
}

const ToolbarButton = ({ onClick, active, disabled, title, icon }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      active ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-primary-700'
    }`}
  >
    {icon}
  </button>
);

const ToolbarDivider = () => <span className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;

const setLink = (editor: Editor) => {
  const previousUrl = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('Enter the link URL', previousUrl || 'https://');
  if (url === null) return;
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

const RichTextEditor = ({ value, onChange, placeholder, compact = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: placeholder || 'Write something...' }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />;
  }

  const headingLevel = editor.isActive('heading')
    ? Number((editor.getAttributes('heading') as { level?: number }).level || 1)
    : null;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-transparent transition-all">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          title="Bold"
          icon={<FiBold className="w-4 h-4" />}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          title="Italic"
          icon={<FiItalic className="w-4 h-4" />}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          title="Underline"
          icon={<FiUnderline className="w-4 h-4" />}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          title="Strikethrough"
          icon={<FiSlash className="w-4 h-4" />}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarDivider />
        {!compact && (
          <>
            <ToolbarButton
              title="Heading 1"
              icon={<FiType className="w-4 h-4" />}
              active={headingLevel === 1}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            />
            <ToolbarButton
              title="Heading 2"
              icon={<FiType className="w-4 h-4 opacity-80" />}
              active={headingLevel === 2}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
              title="Heading 3"
              icon={<FiType className="w-4 h-4 opacity-60" />}
              active={headingLevel === 3}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
            <ToolbarDivider />
          </>
        )}
        <ToolbarButton
          title="Bullet list"
          icon={<FiList className="w-4 h-4" />}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          title="Numbered list"
          icon={<FiHash className="w-4 h-4" />}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          title="Blockquote"
          icon={<FiMessageSquare className="w-4 h-4" />}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        {!compact && (
          <ToolbarButton
            title="Code block"
            icon={<FiCode className="w-4 h-4" />}
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
        )}
        <ToolbarButton
          title="Link"
          icon={<FiLink2 className="w-4 h-4" />}
          active={editor.isActive('link')}
          onClick={() => setLink(editor)}
        />
        <ToolbarDivider />
        <ToolbarButton
          title="Undo"
          icon={<FiRotateCcw className="w-4 h-4" />}
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          title="Redo"
          icon={<FiRotateCcw className="w-4 h-4 rotate-180" />}
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <EditorContent
        editor={editor}
        className={`rich-text-content bg-white ${compact ? 'max-h-40 overflow-y-auto' : 'max-h-96 overflow-y-auto'}`}
      />
    </div>
  );
};

export default RichTextEditor;
