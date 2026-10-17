import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Bot,
  Sparkles,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Code,
  Shield,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

const SPECIALIST_AGENTS = [
  {
    id: 'agent-architect',
    name: 'BRAHMA Architect',
    role: 'System & Infrastructure Orchestration',
    icon: Sparkles,
    badgeVariant: 'gold',
    status: 'active',
    statusLabel: 'Online & Operational',
    description: 'Specializes in distributed system architectures, native Windows IPC, REST API contracts, and security boundaries.',
    capabilities: [
      'Full-stack architecture evaluation',
      'Native Windows script synthesis',
      'Database constraint & Prisma modeling',
      'Internal service-to-service key validation'
    ],
    permissions: 'Read/Write to Workspace Projects & Conversation Logs',
    modelEngine: 'BRAHMA Core Orchestrator (Mock/Synthesis Provider)'
  },
  {
    id: 'agent-researcher',
    name: 'Research Specialist',
    role: 'Multi-Source Synthesis & Fact Verification',
    icon: BookOpen,
    badgeVariant: 'cyan',
    status: 'active',
    statusLabel: 'Online & Operational',
    description: 'Conducts deep literature reviews, verifies citation domains, and produces executive briefings.',
    capabilities: [
      'Cross-source citation analysis',
      'Confidence score verification',
      'Academic RFC synthesis',
      'Executive summary formatting'
    ],
    permissions: 'Read-only access to Web & Document indices',
    modelEngine: 'BRAHMA Core Research Pipeline'
  },
  {
    id: 'agent-docs',
    name: 'Document Synthesizer',
    role: 'RAG Extraction & Structural Parsing',
    icon: FileText,
    badgeVariant: 'violet',
    status: 'active',
    statusLabel: 'Online & Operational',
    description: 'Extracts concepts, architectural rules, and tabular summaries from markdown, specifications, and text files.',
    capabilities: [
      'Markdown AST parsing',
      'Entity & token relationship extraction',
      'Automated glossary generation',
      'Session RAG prompt injection'
    ],
    permissions: 'Read-only access to uploaded document store',
    modelEngine: 'BRAHMA Core Document Extractor'
  },
  {
    id: 'agent-visual',
    name: 'Visual Concept Director',
    role: 'Cosmic Generative Geometry',
    icon: ImageIcon,
    badgeVariant: 'violet',
    status: 'active',
    statusLabel: 'Online & Operational',
    description: 'Creates sacred celestial geometry, architectural wireframes, and cosmic UI asset layouts.',
    capabilities: [
      'Procedural SVG mandala rendering',
      'Aspect ratio geometric calculation',
      'Cosmic color token alignment',
      'UI asset styling guides'
    ],
    permissions: 'Canvas & Asset Gallery generation',
    modelEngine: 'BRAHMA Core Visual Synthesizer'
  },
  {
    id: 'agent-astra-code',
    name: 'ASTRA Code Engineer',
    role: 'Celestial Arrow Coding Agent',
    icon: Code,
    badgeVariant: 'blue',
    status: 'standby',
    statusLabel: 'Sandboxed (Milestone 4 Preview)',
    description: 'Dedicated software engineering agent in ASTRA workspace. Generates unified diff patches with strict process security boundaries.',
    capabilities: [
      'AST-aware code refactoring',
      'Unified patch generation',
      'Security boundary sandboxing',
      'Zero arbitrary host process execution'
    ],
    permissions: 'Sandboxed file workspace (Host execution disabled)',
    modelEngine: 'ASTRA Engine (Port 8002) + ASTRA Runner (Port 8003)'
  }
];

export function AgentsWorkspace() {
  const { navigate } = useNavigation();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  async function handleStartChat(agent) {
    setStartingChat(true);
    try {
      // Create a new conversation tagged with the specialist agent
      const conv = await api.createConversation({
        title: `${agent.name} Session`
      });
      navigate('chat');
    } catch {
      navigate('chat');
    } finally {
      setStartingChat(false);
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Specialist AI Agents
            </h1>
            <Badge variant="gold" icon={Bot}>Atlas Screen 10</Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Role-based specialist intelligence agents with clear capabilities and transparent permission disclosures.
          </p>
        </div>
      </div>

      {/* Honesty Disclosure Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(246, 200, 122, 0.1)',
          border: '1px solid rgba(246, 200, 122, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: 'var(--brahma-gold)'
        }}
      >
        <Shield size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Capability Disclosure:</strong> Each agent operates with defined product roles and explicit permissions. We never disguise generic LLM wrappers as real agents; capabilities reflect verified backend services.
        </span>
      </div>

      {/* Agent Roster Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
        {SPECIALIST_AGENTS.map(agent => {
          const Icon = agent.icon;
          const isActive = agent.status === 'active';

          return (
            <Card key={agent.id} hoverable glow={agent.badgeVariant}>
              {/* Agent Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: agent.badgeVariant === 'gold' ? 'var(--brahma-gold)' : agent.badgeVariant === 'cyan' ? 'var(--brahma-cyan)' : 'var(--brahma-violet-light)'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {agent.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {agent.role}
                    </div>
                  </div>
                </div>

                <Badge variant={isActive ? 'success' : 'gold'}>
                  {isActive ? 'Active' : 'Standby'}
                </Badge>
              </div>

              {/* Description */}
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 14px 0', minHeight: '40px' }}>
                {agent.description}
              </p>

              {/* Capabilities List */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brahma-gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Specialist Capabilities
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {agent.capabilities.slice(0, 3).map((cap, cIdx) => (
                    <div key={cIdx} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={12} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgent(agent)}
                >
                  Permissions
                </Button>

                {agent.id === 'agent-astra-code' ? (
                  <Button
                    variant="astra"
                    size="sm"
                    icon={Code}
                    onClick={() => navigate('astra-launcher')}
                  >
                    Launch ASTRA
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={MessageSquare}
                    disabled={startingChat}
                    onClick={() => handleStartChat(agent)}
                  >
                    Start Chat
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Agent Permissions & Detail Modal */}
      {selectedAgent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAgent(null)}
          title={`${selectedAgent.name} — Capabilities & Disclosure`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned Role
              </label>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {selectedAgent.role}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Backend Engine
              </label>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--brahma-cyan)', marginTop: '4px' }}>
                {selectedAgent.modelEngine}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Access Permissions Boundary
              </label>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px', padding: '10px 12px', backgroundColor: 'rgba(17, 24, 39, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                {selectedAgent.permissions}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Capabilities Checklist
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {selectedAgent.capabilities.map((cap, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={MessageSquare}
                onClick={() => {
                  const ag = selectedAgent;
                  setSelectedAgent(null);
                  handleStartChat(ag);
                }}
              >
                Chat with Agent
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
