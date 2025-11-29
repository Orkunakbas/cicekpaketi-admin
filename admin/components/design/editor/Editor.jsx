'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Youtube from '@tiptap/extension-youtube';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { BackgroundColor } from '@tiptap/extension-text-style/background-color';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Emoji from '@tiptap/extension-emoji';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import { 
  FiChevronDown, 
  FiBold, 
  FiItalic, 
  FiUnderline,
  FiLink,
  FiList,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatQuote, MdStrikethroughS, MdFormatColorText, MdFormatColorFill, MdChecklist } from 'react-icons/md';
import { BsCodeSlash, BsTable, BsYoutube, BsEmojiSmile, BsImage } from 'react-icons/bs';

const Editor = ({ content, onChange }) => {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showBgColorMenu, setShowBgColorMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showYoutubeMenu, setShowYoutubeMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [imageAlign, setImageAlign] = useState('left');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);
  const dropdownRef = useRef(null);
  const tableDropdownRef = useRef(null);
  const colorDropdownRef = useRef(null);
  const bgColorDropdownRef = useRef(null);
  const linkDropdownRef = useRef(null);
  const emojiDropdownRef = useRef(null);
  const imageDropdownRef = useRef(null);
  const youtubeDropdownRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        width: 640,
        height: 480,
      }),
      TextStyle,
      Color,
      BackgroundColor,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300 transition-colors',
        },
      }),
      Emoji.configure({
        enableEmoticons: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHeadingMenu(false);
      }
      if (tableDropdownRef.current && !tableDropdownRef.current.contains(event.target)) {
        setShowTableMenu(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target)) {
        setShowColorMenu(false);
      }
      if (bgColorDropdownRef.current && !bgColorDropdownRef.current.contains(event.target)) {
        setShowBgColorMenu(false);
      }
      if (linkDropdownRef.current && !linkDropdownRef.current.contains(event.target)) {
        setShowLinkMenu(false);
      }
      if (emojiDropdownRef.current && !emojiDropdownRef.current.contains(event.target)) {
        setShowEmojiMenu(false);
      }
      if (imageDropdownRef.current && !imageDropdownRef.current.contains(event.target)) {
        setShowImageMenu(false);
      }
      if (youtubeDropdownRef.current && !youtubeDropdownRef.current.contains(event.target)) {
        setShowYoutubeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setHeading = (level) => {
    if (!editor) return;
    
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setHeading({ level }).run();
    }
    setShowHeadingMenu(false);
  };

  const getActiveHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Başlık 1';
    if (editor.isActive('heading', { level: 2 })) return 'Başlık 2';
    if (editor.isActive('heading', { level: 3 })) return 'Başlık 3';
    if (editor.isActive('heading', { level: 4 })) return 'Başlık 4';
    if (editor.isActive('heading', { level: 5 })) return 'Başlık 5';
    if (editor.isActive('heading', { level: 6 })) return 'Başlık 6';
    return 'Normal';
  };

  const ToolbarButton = ({ onClick, isActive, icon: Icon, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      <Icon size={18} />
    </button>
  );

  const insertYoutube = () => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
      setShowYoutubeMenu(false);
      setYoutubeUrl('');
    }
  };

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const applyTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowColorMenu(false);
  };

  const applyBgColor = (color) => {
    editor.chain().focus().setBackgroundColor(color).run();
    setShowBgColorMenu(false);
  };

  const emojis = [
    '😊', '😂', '🤣', '😁', '😄', '😆', '😅', '🤩', '😍', '🥰', '😘', '😗',
    '😙', '😚', '🙂', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣',
    '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝',
    '🤤', '😒', '😓', '😔', '😕', '😖', '🙃', '😲', '🥳', '😎', '🤓', '🧐'
  ];

  const applyLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setShowLinkMenu(false);
      setLinkUrl('');
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkMenu(false);
    setLinkUrl('');
  };

  const insertEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji).run();
    setShowEmojiMenu(false);
  };

  const insertImage = () => {
    if (imageUrl) {
      // Resmi ekle
      editor.chain().focus().setImage({ 
        src: imageUrl,
      }).run();
      
      // Boyut ve hizalama uygula
      setTimeout(() => {
        // Aynı URL'e sahip tüm resimleri bul ve EN SONUNCUsunu al
        const allImages = editor.view.dom.querySelectorAll('img[src="' + imageUrl + '"]');
        const img = allImages[allImages.length - 1]; // En son eklenen resim
        
        if (img) {
          // Hizalama class ekle
          const alignClass = imageAlign === 'center' ? 'img-align-center' : 
                            imageAlign === 'right' ? 'img-align-right' : 'img-align-left';
          img.classList.add(alignClass);
          
          // Width ve Height ayarla (girilmişse)
          if (imageWidth && imageWidth.trim() !== '') {
            const width = imageWidth.trim();
            const widthValue = width.includes('px') || width.includes('%') ? width : width + 'px';
            img.style.width = widthValue;
            img.style.maxWidth = 'none'; // max-width'i kaldır
            img.setAttribute('data-width', width);
          }
          if (imageHeight && imageHeight.trim() !== '') {
            const height = imageHeight.trim();
            const heightValue = height.includes('px') || height.includes('%') ? height : height + 'px';
            img.style.height = heightValue;
            img.setAttribute('data-height', height);
          } else if (imageWidth && imageWidth.trim() !== '') {
            img.style.height = 'auto'; // Width varsa height auto
          }
          
          img.style.display = 'block';
          img.setAttribute('data-align', imageAlign);
          
          // Hizalama margin'leri uygula
          if (imageAlign === 'center') {
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
          } else if (imageAlign === 'right') {
            img.style.marginLeft = 'auto';
            img.style.marginRight = '0';
          } else {
            img.style.marginLeft = '0';
            img.style.marginRight = 'auto';
          }
        }
      }, 100);
      
      setShowImageMenu(false);
      setImageUrl('');
      setImageWidth('');
      setImageHeight('');
      setImageAlign('left');
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: tableWithHeader 
    }).run();
    setShowTableMenu(false);
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-2 flex items-center gap-1 bg-gray-900/30 flex-wrap">
        {/* Heading Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
          >
            <span>{getActiveHeading()}</span>
            <FiChevronDown className={`transition-transform ${showHeadingMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[160px]">
              <button
                type="button"
                onClick={() => setHeading(0)}
                className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 first:rounded-t-lg transition-colors"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setHeading(1)}
                className="w-full text-left px-4 py-2 text-2xl font-bold text-white hover:bg-gray-800 transition-colors"
              >
                Başlık 1
              </button>
              <button
                type="button"
                onClick={() => setHeading(2)}
                className="w-full text-left px-4 py-2 text-xl font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Başlık 2
              </button>
              <button
                type="button"
                onClick={() => setHeading(3)}
                className="w-full text-left px-4 py-2 text-lg font-semibold text-gray-200 hover:bg-gray-800 transition-colors"
              >
                Başlık 3
              </button>
              <button
                type="button"
                onClick={() => setHeading(4)}
                className="w-full text-left px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Başlık 4
              </button>
              <button
                type="button"
                onClick={() => setHeading(5)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Başlık 5
              </button>
              <button
                type="button"
                onClick={() => setHeading(6)}
                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 last:rounded-b-lg transition-colors"
              >
                Başlık 6
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={FiBold}
          title="Kalın (Ctrl+B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={FiItalic}
          title="İtalik (Ctrl+I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={FiUnderline}
          title="Altı Çizili (Ctrl+U)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={MdStrikethroughS}
          title="Üstü Çizili"
        />
        
        {/* Link */}
        <div className="relative" ref={linkDropdownRef}>
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href;
              setLinkUrl(previousUrl || '');
              setShowLinkMenu(!showLinkMenu);
            }}
            title="Link Ekle"
            className={`p-2 rounded transition-colors ${
              editor.isActive('link')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <FiLink size={18} />
          </button>

          {showLinkMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4 min-w-[280px]">
              <div className="space-y-3">
                <div className="text-xs text-gray-400 font-medium">Link URL</div>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-indigo-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyLink();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyLink}
                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Link Ekle
                  </button>
                  {editor.isActive('link') && (
                    <button
                      type="button"
                      onClick={removeLink}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Text Color */}
        <div className="relative" ref={colorDropdownRef}>
          <button
            type="button"
            onClick={() => setShowColorMenu(!showColorMenu)}
            title="Metin Rengi"
            className="p-2 rounded transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <MdFormatColorText size={18} />
          </button>

          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4 min-w-[280px]">
              <div className="space-y-3">
                <div className="text-xs text-gray-400 font-medium">Hazır Renkler</div>
                <div className="grid grid-cols-9 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyTextColor(color)}
                      className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs text-gray-400 font-medium mb-2">Özel Renk</div>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors">
                    <input
                      type="color"
                      onChange={(e) => applyTextColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">Renk Seçici</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative" ref={bgColorDropdownRef}>
          <button
            type="button"
            onClick={() => setShowBgColorMenu(!showBgColorMenu)}
            title="Arka Plan Rengi"
            className="p-2 rounded transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <MdFormatColorFill size={18} />
          </button>

          {showBgColorMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4 min-w-[280px]">
              <div className="space-y-3">
                <div className="text-xs text-gray-400 font-medium">Hazır Renkler</div>
                <div className="grid grid-cols-9 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => applyBgColor(color)}
                      className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs text-gray-400 font-medium mb-2">Özel Renk</div>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors">
                    <input
                      type="color"
                      onChange={(e) => applyBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-300">Renk Seçici</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={FiList}
          title="Madde İşaretli Liste"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={MdFormatListNumbered}
          title="Numaralı Liste"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          icon={MdChecklist}
          title="Görev Listesi"
        />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Text Align */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={FiAlignLeft}
          title="Sola Hizala"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={FiAlignCenter}
          title="Ortala"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon={FiAlignRight}
          title="Sağa Hizala"
        />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Block Types */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={MdFormatQuote}
          title="Alıntı"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={BsCodeSlash}
          title="Kod Bloğu"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          icon={FiMinus}
          title="Yatay Çizgi"
        />
        
        {/* Emoji */}
        <div className="relative" ref={emojiDropdownRef}>
          <button
            type="button"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            title="Emoji Ekle"
            className="p-2 rounded transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <BsEmojiSmile size={18} />
          </button>

          {showEmojiMenu && (
            <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4">
              <div className="space-y-3">
                <div className="text-xs text-gray-400 font-medium">Emoji Seç</div>
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="grid grid-rows-4 grid-flow-col gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-800 transition-colors text-2xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Table */}
        <div className="relative" ref={tableDropdownRef}>
          <button
            type="button"
            onClick={() => setShowTableMenu(!showTableMenu)}
            title="Tablo Ekle"
            className={`p-2 rounded transition-colors ${
              editor.isActive('table')
                ? 'bg-pink-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <BsTable size={18} />
          </button>

          {/* Table Dropdown */}
          {showTableMenu && (
            <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4 min-w-[220px]">
              <div className="space-y-3">
                {/* Rows Input */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Satır Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-pink-600"
                  />
                </div>

                {/* Cols Input */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Sütun Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-pink-600"
                  />
                </div>

                {/* Header Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tableHeader"
                    checked={tableWithHeader}
                    onChange={(e) => setTableWithHeader(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-pink-600 focus:ring-pink-600 focus:ring-offset-0"
                  />
                  <label htmlFor="tableHeader" className="text-sm text-gray-300 cursor-pointer">
                    Başlık satırı ekle
                  </label>
                </div>

                {/* Insert Button */}
                <button
                  type="button"
                  onClick={insertTable}
                  className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Tablo Ekle
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Image */}
        <div className="relative" ref={imageDropdownRef}>
          <button
            type="button"
            onClick={() => setShowImageMenu(!showImageMenu)}
            title="Resim Ekle"
            className="p-2 rounded transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <BsImage size={18} />
          </button>

          {showImageMenu && (
            <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4 min-w-[360px]">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-2">Resim URL</div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-indigo-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        insertImage();
                      }
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-400 font-medium mb-2">Genişlik (Opsiyonel)</div>
                    <div className="relative">
                      <input
                        type="text"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(e.target.value)}
                        placeholder="500"
                        className="w-full pl-3 pr-12 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-indigo-600"
                      />
                      <span className="absolute right-0 top-0 h-full px-3 flex items-center text-sm text-gray-400 bg-gray-700 border-l border-gray-600 rounded-r">
                        px
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-medium mb-2">Yükseklik (Opsiyonel)</div>
                    <div className="relative">
                      <input
                        type="text"
                        value={imageHeight}
                        onChange={(e) => setImageHeight(e.target.value)}
                        placeholder="300"
                        className="w-full pl-3 pr-12 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-indigo-600"
                      />
                      <span className="absolute right-0 top-0 h-full px-3 flex items-center text-sm text-gray-400 bg-gray-700 border-l border-gray-600 rounded-r">
                        px
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-2">Hizalama</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'left', label: 'Sol', icon: FiAlignLeft },
                      { value: 'center', label: 'Orta', icon: FiAlignCenter },
                      { value: 'right', label: 'Sağ', icon: FiAlignRight }
                    ].map((align) => (
                      <button
                        key={align.value}
                        type="button"
                        onClick={() => setImageAlign(align.value)}
                        className={`px-2 py-2 text-xs rounded transition-colors flex items-center justify-center gap-1 ${
                          imageAlign === align.value
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <align.icon size={14} />
                        <span>{align.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={insertImage}
                  className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Resim Ekle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* YouTube */}
        <div className="relative" ref={youtubeDropdownRef}>
          <button
            type="button"
            onClick={() => setShowYoutubeMenu(!showYoutubeMenu)}
            title="YouTube Video Ekle"
            className={`p-2 rounded transition-colors ${
              editor.isActive('youtube')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <BsYoutube size={18} />
          </button>

          {showYoutubeMenu && (
            <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] p-4 min-w-[280px]">
              <div className="space-y-3">
                <div className="text-xs text-gray-400 font-medium">YouTube Video URL</div>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 focus:outline-none focus:border-indigo-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      insertYoutube();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={insertYoutube}
                  className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Video Ekle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          icon={FiRotateCcw}
          title="Geri Al (Ctrl+Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          icon={FiRotateCw}
          title="Yinele (Ctrl+Y)"
        />
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
