import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Brain,
  Plus,
  Search,
  Trash2,
  Download,
  Pause,
  Play,
  Shield,
  Info,
  CheckCircle2,
  Filter
} from 'lucide-react';

const INITIAL_MEMORIES = [
  {
    id: 'mem-1',
    category: 'Architecture',
    title: 'Native Windows Zero-Docker Requirement',
    content: 'BRAHMA and ASTRA must run natively on Windows without requiring Docker containers or WSL. Process boundaries are managed via PowerShell scripts.',
    createdAt: '2026-10-15',
    active: true
  },
  {
    id: 'mem-2',
    category: 'Design System',
    title: 'Locked Typography: Poppins + JetBrains Mono',
    content: 'All UI elements use Poppins font. All code, monospace labels, and terminal outputs strictly use JetBrains Mono. Do not modify approved design tokens.',
    createdAt: '2026-10-14',
    active: true
  },
  {
    id: 'mem-3',
    category: 'Security',
    title: 'ASTRA Runner Execution Sandbox Status',
    content: 'Arbitrary host process execution is strictly disabled. Code proposals generate structured unified diff patches for manual inspection.',
    createdAt: '2026-10-13',
    active: true
  }
];

export function MemoryWorkspace() {
  const [memories, setMemories] = useState(INITIAL_MEMORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [memoryPaused, setMemoryPaused] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Architecture');

  function handleAddMemory(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newMem = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      active: true
    };

    setMemories(prev => [newMem, ...prev]);
    setNewTitle('');
    setNewContent('');
    setIsAddModalOpen(false);
  }

  function handleDelete(id) {
    setMemories(prev => prev.filter(m => m.id !== id));
  }

  function handleExportJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `brahma-memory-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const categories = ['all', 'Architecture', 'Design System', 'Security', 'Preferences'];

  const filteredMemories = memories.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Personal Memory &amp; Knowledge
            </h1>
            <Badge variant="violet" icon={Brain}>Atlas Screen 9</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Inspect, control, and manage persistent architectural rules, user preferences, and synthesized context.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant={memoryPaused ? 'danger' : 'outline'}
            size="md"
            icon={memoryPaused ? Play : Pause}
            onClick={() => setMemoryPaused(prev => !prev)}
            title={memoryPaused ? 'Resume memory recording' : 'Pause memory recording'}
          >
            {memoryPaused ? 'Memory Paused' : 'Pause Memory'}
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={handleExportJson}
            title="Export all memory items as JSON"
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Memory
          </Button>
        </div>
      </div>

      {/* Transparency & Honesty Disclosure Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--brahma-violet-light)'
        }}
      >
        <Shield size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>User Controlled Memory:</strong> BRAHMA memory is strictly opt-in, inspectable, and editable. Memories below are injected into prompt context to maintain long-term architectural continuity.
        </span>
      </div>

      {/* Search and Category Filters */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search stored memory concepts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                backgroundColor: 'rgba(11, 15, 26, 0.7)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: selectedCategory === cat ? 'var(--brahma-violet)' : 'rgba(255, 255, 255, 0.04)',
                  border: selectedCategory === cat ? '1px solid var(--brahma-violet-light)' : '1px solid var(--border-default)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {cat === 'all' ? 'All Memories' : cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Memory Cards Grid */}
      {filteredMemories.length === 0 ? (
        <Card>
          <EmptyState
            icon={Brain}
            title="No Memories Found"
            description="Add custom architectural rules, coding preferences, or domain context to guide BRAHMA."
            actionLabel="Add Memory Concept"
            onAction={() => setIsAddModalOpen(true)}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredMemories.map(mem => (
            <Card key={mem.id} hoverable glow="violet">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <Badge variant="violet">{mem.category}</Badge>
                <button
                  type="button"
                  onClick={() => handleDelete(mem.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Delete memory item"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {mem.title}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                {mem.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-default)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Saved: {mem.createdAt}</span>
                <span style={{ color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Active in Prompt
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Memory Item"
        maxWidth="500px"
      >
        <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
              Category
            </label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="Architecture">Architecture</option>
              <option value="Design System">Design System</option>
              <option value="Security">Security</option>
              <option value="Preferences">Preferences</option>
            </select>
          </div>

          <Input
            label="Memory Title"
            placeholder="e.g. Strict Zero-Docker Windows Execution"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Memory Content / Rule
            </label>
            <textarea
              rows={4}
              placeholder="State the rule, architectural boundary, or guideline that BRAHMA should remember..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              required
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Memory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
