import React, { useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  Ratio,
  Palette,
  AlertCircle,
  Info
} from 'lucide-react';

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square' },
  { id: '16:9', label: '16:9 Landscape' },
  { id: '9:16', label: '9:16 Portrait' },
  { id: '4:3', label: '4:3 Standard' }
];

const STYLES = [
  { id: 'cosmic', label: 'Cosmic Mandala' },
  { id: 'technical', label: 'Architectural Blueprint' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon' },
  { id: 'vector', label: 'Minimalist Vector' }
];

export function ImagesWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('cosmic');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Gallery of generated tasks
  const [gallery, setGallery] = useState([
    {
      id: 'img-1',
      prompt: 'Sacred geometry golden lotus mandala glowing with deep cosmic indigo nebulae and violet starlight',
      ratio: '1:1',
      style: 'Cosmic Mandala',
      createdAt: '2026-10-16',
      status: 'completed',
      // Dynamic inline SVG representing cosmic generative art
      isVectorRender: true
    }
  ]);

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setError(null);

    try {
      // Dispatch image generation task to backend
      const task = await api.createAiTask({
        prompt: `Generate ${selectedStyle} image with aspect ratio ${selectedRatio}: ${prompt}`,
        taskType: 'image',
        parameters: { ratio: selectedRatio, style: selectedStyle }
      });

      // Poll for task status
      let taskResult = null;
      if (task.status === 'completed') {
        taskResult = task.result;
      } else {
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const polled = await api.getAiTask(task.id);
          if (polled.status === 'completed') {
            taskResult = polled.result;
            break;
          } else if (polled.status === 'failed') {
            throw new Error(polled.error || 'Image generation task failed.');
          }
        }
      }

      // Add task result to gallery
      const newEntry = {
        id: `img-${Date.now()}`,
        prompt,
        ratio: selectedRatio,
        style: STYLES.find(s => s.id === selectedStyle)?.label || 'Cosmic',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'completed',
        isVectorRender: true
      };

      setGallery(prev => [newEntry, ...prev]);
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Image generation service error.');
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyPrompt(id, text) {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Visual Generation Studio
            </h1>
            <Badge variant="violet" icon={ImageIcon}>Atlas Screen 7</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create celestial mandalas, architectural diagrams, and brand visuals with prompt controls.
          </p>
        </div>
      </div>

      {/* Honest Backend Disclosure Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--brahma-cyan)'
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Backend Integrity:</strong> Diffusion models are currently executed via BRAHMA Core Orchestrator (Mock/Synthesis Provider). Generative outputs render procedural cosmic vector geometry rather than fabricated bitmap photographs.
        </span>
      </div>

      {/* Generation Prompt Controls */}
      <Card glow="violet">
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brahma-gold)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Image Prompt
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Describe your visual concept (e.g. Celestial arrow orbiting a glowing golden lotus)..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  backgroundColor: 'rgba(11, 15, 26, 0.8)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Sparkles}
                disabled={generating || !prompt.trim()}
              >
                {generating ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          </div>

          {/* Configuration Selectors */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Aspect Ratio */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Ratio size={14} /> Aspect Ratio:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {ASPECT_RATIOS.map(ratio => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedRatio(ratio.id)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: selectedRatio === ratio.id ? 'var(--brahma-violet)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedRatio === ratio.id ? '1px solid var(--brahma-violet-light)' : '1px solid var(--border-default)',
                      color: selectedRatio === ratio.id ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preset */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Palette size={14} /> Style Preset:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {STYLES.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: selectedStyle === st.id ? 'var(--brahma-violet)' : 'rgba(255, 255, 255, 0.04)',
                      border: selectedStyle === st.id ? '1px solid var(--brahma-violet-light)' : '1px solid var(--border-default)',
                      color: selectedStyle === st.id ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Card>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--status-error)',
            color: '#FCA5A5',
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

      {/* Generating Progress State */}
      {generating && (
        <Card>
          <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <LoadingSpinner size="lg" text="Synthesizing visual geometry..." />
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Executing BRAHMA Core Image Task with style: {selectedStyle} ({selectedRatio})
            </p>
          </div>
        </Card>
      )}

      {/* Gallery Grid */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Studio Gallery ({gallery.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {gallery.map(item => {
            const isCopied = copiedId === item.id;
            return (
              <Card key={item.id} hoverable glow="violet">
                {/* Visual Art Canvas */}
                <div
                  style={{
                    height: '240px',
                    borderRadius: 'var(--radius-md)',
                    background: 'radial-gradient(circle at center, #1E1B3D 0%, #0B0F1A 100%)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Procedural Celestial Geometry Canvas */}
                  <svg width="180" height="180" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 16px rgba(246, 200, 122, 0.4))' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F6C87A" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />
                    <circle cx="50" cy="50" r="34" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.8" />
                    <circle cx="50" cy="50" r="24" fill="none" stroke="#06B6D4" strokeWidth="0.8" />
                    <polygon points="50,15 80,68 20,68" fill="none" stroke="#F6C87A" strokeWidth="1.2" opacity="0.8" />
                    <polygon points="50,85 80,32 20,32" fill="none" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.8" />
                    <circle cx="50" cy="50" r="6" fill="#F6C87A" />
                  </svg>

                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <Badge variant="gold">{item.ratio}</Badge>
                  </div>

                  <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                    <Badge variant="cyan">{item.style}</Badge>
                  </div>
                </div>

                {/* Details & Actions */}
                <div style={{ marginTop: '14px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', margin: '0 0 10px 0', minHeight: '40px' }}>
                    "{item.prompt}"
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {item.createdAt}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(item.id, item.prompt)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isCopied ? 'var(--status-success)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px'
                        }}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{isCopied ? 'Copied' : 'Prompt'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
