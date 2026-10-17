import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { FolderPlus, AlertCircle } from 'lucide-react';

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const project = await api.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic
      });
      setName('');
      setDescription('');
      setIsPublic(false);
      onProjectCreated?.(project);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" maxWidth="480px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--status-error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-error)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Project Name"
          placeholder="e.g., Hospital Dashboard System"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Description (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of project goals and scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(17, 24, 39, 0.75)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
          <input
            type="checkbox"
            id="isPublicCheck"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            disabled={isLoading}
            style={{ accentColor: 'var(--brand-violet)', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="isPublicCheck" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Make this project public to workspace members
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            icon={FolderPlus}
            isLoading={isLoading}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
