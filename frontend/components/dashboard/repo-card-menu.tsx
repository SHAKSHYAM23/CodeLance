'use client'; 

import { useState, useRef, useEffect } from 'react';
import { deleteDocument } from '@/lib/api';

interface RepoCardMenuProps {
  documentId: string;
  onDeleteSuccess: (id: string) => void;
}

export default function RepoCardMenu({ documentId, onDeleteSuccess }: RepoCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this repository? All chats and embeddings will be lost.")) return;
    
    setIsDeleting(true);
    try {
      await deleteDocument(documentId);
      setIsOpen(false);
      onDeleteSuccess(documentId);
    } catch (error) {
      console.error("Failed to delete repository:", error);
      alert("Failed to delete repository. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }} 
        className="p-1 rounded-md transition-colors z-10 relative"
        style={{ color: '#3a5a78' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#3a5a78'; }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-6 mt-1 w-36 rounded-md shadow-xl z-50 overflow-hidden"
          style={{ background: '#0F172A', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }} 
            disabled={isDeleting}
            className="flex items-center w-full px-4 py-2 text-sm transition-colors text-red-400 disabled:opacity-50"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}