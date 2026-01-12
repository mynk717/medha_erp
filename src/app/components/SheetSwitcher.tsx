'use client';

import { useState } from 'react';
import { Check, Plus, Trash2, Edit2, X } from 'lucide-react';

interface Sheet {
  id: string;
  tag: string;
  addedAt: number;
  lastUsed: number;
}

interface SheetSwitcherProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSwitch: (sheetId: string) => void;
  onAdd: (sheetId: string, tag: string) => void;
  onRemove: (sheetId: string) => void;
  onUpdateTag: (sheetId: string, newTag: string) => void;
}

export default function SheetSwitcher({ 
  sheets, 
  activeSheetId, 
  onSwitch, 
  onAdd, 
  onRemove,
  onUpdateTag 
}: SheetSwitcherProps) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newSheetId, setNewSheetId] = useState('');
  const [newSheetTag, setNewSheetTag] = useState('');
  const [editingSheet, setEditingSheet] = useState<string | null>(null);
  const [editTag, setEditTag] = useState('');

  const handleAdd = () => {
    if (newSheetId.length > 20 && newSheetTag.trim()) {
      onAdd(newSheetId, newSheetTag);
      setNewSheetId('');
      setNewSheetTag('');
      setShowAddSheet(false);
    } else {
      alert('Please provide both a valid Sheet ID and a tag name');
    }
  };

  const handleUpdateTag = (sheetId: string) => {
    if (editTag.trim()) {
      onUpdateTag(sheetId, editTag);
      setEditingSheet(null);
      setEditTag('');
    }
  };

  return (
    <div style={{
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '16px', 
        fontWeight: '600',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        📊 My Sheets
        <button
          onClick={() => setShowAddSheet(!showAddSheet)}
          style={{
            background: showAddSheet ? '#f1f5f9' : '#6366f1',
            color: showAddSheet ? '#475569' : 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {showAddSheet ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddSheet ? 'Cancel' : 'Add Sheet'}
        </button>
      </h3>

      {/* Add New Sheet Form */}
      {showAddSheet && (
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '6px',
              color: '#475569',
              fontSize: '14px'
            }}>
              Sheet Tag Name *
            </label>
            <input
              type="text"
              value={newSheetTag}
              onChange={(e) => setNewSheetTag(e.target.value)}
              placeholder="e.g., Jan2026, Q1-2026, Main"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '6px',
              color: '#475569',
              fontSize: '14px'
            }}>
              Google Sheet ID *
            </label>
            <input
              type="text"
              value={newSheetId}
              onChange={(e) => setNewSheetId(e.target.value)}
              placeholder="Paste Sheet ID from URL"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Find it in URL: docs.google.com/spreadsheets/d/<strong>YOUR_SHEET_ID</strong>/edit
            </small>
          </div>

          <button
            onClick={handleAdd}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              width: '100%'
            }}
          >
            Add Sheet
          </button>
        </div>
      )}

      {/* Connected Sheets List */}
      {sheets.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          No sheets connected yet. Click "Add Sheet" to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sheets
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .map((sheet) => {
              const isActive = sheet.id === activeSheetId;
              const isEditing = editingSheet === sheet.id;

              return (
                <div
                  key={sheet.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: isActive ? '#eef2ff' : '#f8fafc',
                    border: isActive ? '2px solid #6366f1' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => !isEditing && onSwitch(sheet.id)}
                >
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '6px 10px',
                          border: '2px solid #6366f1',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          width: '200px'
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <div style={{ 
                          fontWeight: '700', 
                          color: isActive ? '#4f46e5' : '#1e293b',
                          marginBottom: '4px',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {isActive && <Check className="w-4 h-4 text-green-600" />}
                          {sheet.tag}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#64748b',
                          fontFamily: 'monospace'
                        }}>
                          ID: ...{sheet.id.slice(-12)}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdateTag(sheet.id)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingSheet(null);
                            setEditTag('');
                          }}
                          style={{
                            background: '#94a3b8',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingSheet(sheet.id);
                            setEditTag(sheet.tag);
                          }}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit tag"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${sheet.tag}" sheet?`)) {
                              onRemove(sheet.id);
                            }
                          }}
                          style={{
                            background: '#fef2f2',
                            color: '#ef4444',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove sheet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
