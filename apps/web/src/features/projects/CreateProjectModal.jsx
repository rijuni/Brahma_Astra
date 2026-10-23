import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { projectService } from '../../services/project-service';
import { useToast } from '../../components/feedback/Toast';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const created = await projectService.create({ name: name.trim(), description: description.trim() });
      addToast(`Project "${created.name}" created successfully!`, 'success');
      setName('');
      setDescription('');
      onProjectCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="glass-card"
            style={{
              padding: '10px 14px',
              marginBottom: '16px',
              borderColor: 'var(--status-error)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--status-error)',
              fontSize: '13px'
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Project Name"
          placeholder="e.g. Healthcare AI Assistant"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          autoFocus
        />

        <div className="flex flex-col gap-1 w-full" style={{ marginBottom: '20px' }}>
          <label className="body-small" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Description (Optional)
          </label>
          <textarea
            className="glass-input body-regular"
            rows={3}
            placeholder="Brief overview of the project scope and goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" isLoading={isLoading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
