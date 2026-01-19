# Markdown Editor for Lesson Notes

## Overview

The lesson notes management feature now includes a powerful markdown editor with live preview, allowing instructors to create rich, formatted content for their lessons.

## Features

### Markdown Editor Component

**Location:** `components/MarkdownEditor.tsx`

**Features:**
- **Split View**: Edit and preview side-by-side
- **Edit Mode**: Full-width editor for focused writing
- **Preview Mode**: Full-width preview to see final output
- **Fullscreen Mode**: Maximize editor for distraction-free writing
- **Live Preview**: Real-time markdown rendering
- **Markdown Support**: Full GitHub Flavored Markdown (GFM) support

**View Modes:**
1. **Edit**: Full-width text editor
2. **Split**: Editor and preview side-by-side
3. **Preview**: Full-width rendered preview

### Lesson Notes Page

**Location:** `app/instructor/lesson/[lessonId]/notes/page.tsx`

**Features:**
- Create, edit, and delete lesson notes
- Organize notes by sections (Introduction, Objectives, Content, etc.)
- Markdown editor with live preview
- Toggle between markdown source and rendered preview
- Section-based organization
- Responsive design

## Markdown Support

The editor supports GitHub Flavored Markdown including:

- **Headers**: `# H1`, `## H2`, `### H3`, etc.
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Code**: `` `inline code` ``
- **Code Blocks**: ` ```language code ``` `
- **Lists**: `- item` or `1. item`
- **Links**: `[text](url)`
- **Images**: `![alt](url)`
- **Blockquotes**: `> quote`
- **Tables**: Markdown table syntax
- **Strikethrough**: `~~text~~`
- **Task Lists**: `- [ ] task` or `- [x] completed`

## Usage

### Creating a Note

1. Navigate to `/instructor/lesson/[lessonId]/notes`
2. Click "Add Note" button
3. Select a section (Introduction, Objectives, Content, etc.)
4. Enter a title
5. Write content in the markdown editor
6. Use the toolbar to switch between Edit, Split, and Preview modes
7. Click "Save Note"

### Editing a Note

1. Click the edit icon (pencil) on any note
2. Modify the content in the markdown editor
3. Use preview modes to see how it will look
4. Click "Update Note"

### Viewing Notes

- Notes are organized by section
- Click the eye icon to toggle between markdown source and rendered preview
- Each note shows last updated timestamp

## Markdown Tips

### Basic Formatting

```markdown
# Main Heading
## Subheading
### Sub-subheading

**Bold text** and *italic text*

- Bullet point
- Another point

1. Numbered item
2. Another item

`inline code`

```javascript
// Code block
function example() {
  return true;
}
```

[Link text](https://example.com)

![Image alt text](image-url.jpg)
```

### Advanced Features

```markdown
> This is a blockquote
> It can span multiple lines

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |

- [ ] Uncompleted task
- [x] Completed task

~~Strikethrough text~~
```

## Styling

The markdown content is styled with:
- Clean typography
- Proper spacing
- Syntax highlighting for code blocks
- Styled tables
- Formatted blockquotes
- Responsive images

All styles are defined in `app/globals.css` under `.markdown-content` class.

## Keyboard Shortcuts

While typing in the editor:
- Use standard text editing shortcuts
- Tab for indentation
- Enter for new lines

## Best Practices

1. **Use Headers**: Structure your content with proper heading hierarchy
2. **Code Blocks**: Use code blocks for examples and snippets
3. **Lists**: Use lists for step-by-step instructions
4. **Links**: Add links to external resources
5. **Images**: Include images for visual explanations
6. **Preview**: Always preview before saving to ensure formatting is correct

## Technical Details

### Dependencies

- `react-markdown`: Markdown rendering
- `remark-gfm`: GitHub Flavored Markdown support

### Component Props

```typescript
interface MarkdownEditorProps {
  value: string;              // Current markdown content
  onChange: (value: string) => void;  // Change handler
  placeholder?: string;       // Placeholder text
  minHeight?: string;        // Minimum height (default: '400px')
}
```

### API Endpoints

- `GET /api/lesson-notes?lessonId=xxx` - Get notes for a lesson
- `POST /api/lesson-notes` - Create a new note
- `PUT /api/lesson-notes` - Update an existing note
- `DELETE /api/lesson-notes/[id]` - Delete a note

## Troubleshooting

### Markdown not rendering
- Make sure content is valid markdown syntax
- Check browser console for errors
- Verify `react-markdown` is installed

### Editor not showing
- Check that the component is imported correctly
- Verify CSS styles are loaded
- Check browser console for errors

### Preview not updating
- Ensure `onChange` handler is working
- Check that `value` prop is updating
- Verify React state is updating correctly

## Future Enhancements

Potential improvements:
- Syntax highlighting in code blocks
- Markdown toolbar with formatting buttons
- Auto-save functionality
- Version history
- Collaborative editing
- Export to PDF/HTML

