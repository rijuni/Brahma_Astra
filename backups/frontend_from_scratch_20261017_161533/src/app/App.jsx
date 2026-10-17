import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Atom, Bell, BookOpen, BrainCircuit,
  Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Code2, Command, Copy, File,
  FileCode2, FileText, Folder, FolderKanban, GitBranch, Image as ImageIcon,
  LayoutDashboard, Menu, MessageSquare, MoreHorizontal, PanelLeftClose, Play,
  Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Terminal, TerminalSquare,
  Users, WandSparkles, X, Zap, CheckCircle2, Circle, Download, Save, RotateCcw
} from 'lucide-react';
import './App.css';

const STORAGE = 'brahma-astra-milestone-4';
const seedProjects = [
  { id: 'p1', title: 'Radiology Intelligence', type: 'Healthcare · AI research', color: 'violet', updated: 'Updated recently', progress: 72 },
  { id: 'p2', title: 'BRAHMA Core', type: 'Platform · Engineering', color: 'gold', updated: 'Updated yesterday', progress: 48 },
  { id: 'p3', title: 'Knowledge Atlas', type: 'Research · Knowledge base', color: 'cyan', updated: 'Updated 2 days ago', progress: 86 },
];
const seedConversations = [
  { id: 'c1', title: 'Designing the next generation of clinical AI', detail: 'Map the next iteration of the radiology intelligence workspace.', time: 'Recently', tag: 'Healthcare', messages: [] },
  { id: 'c2', title: 'ASTRA runner security checklist', detail: 'Review isolation boundaries and execution policy.', time: 'Yesterday', tag: 'Engineering', messages: [] },
  { id: 'c3', title: 'Research synthesis — multimodal models', detail: 'Compare approaches and identify a practical evaluation plan.', time: 'Earlier', tag: 'Research', messages: [] },
];
const navGroups = [
  { label: 'WORKSPACE', items: [
    { id: 'dashboard', label: 'Home dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Conversations', icon: MessageSquare },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
  ]},
  { label: 'CREATE & DISCOVER', items: [
    { id: 'research', label: 'Research', icon: BrainCircuit },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'images', label: 'Image studio', icon: ImageIcon },
    { id: 'memory', label: 'Memory', icon: BookOpen },
  ]},
  { label: 'BUILD', items: [
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'astra', label: 'Open ASTRA', icon: TerminalSquare, special: true },
  ]},
];
const quickActions = [
  { id: 'chat', title: 'Start a conversation', text: 'Think through an idea with BRAHMA.', icon: MessageSquare, color: 'violet' },
  { id: 'research', title: 'Explore a topic', text: 'Turn questions into structured insight.', icon: BrainCircuit, color: 'cyan' },
  { id: 'documents', title: 'Create a document', text: 'Shape your thoughts into something clear.', icon: FileText, color: 'gold' },
  { id: 'astra', title: 'Build with ASTRA', text: 'Enter your focused coding workspace.', icon: TerminalSquare, color: 'blue' },
];
const starterFiles = [
  { name: 'src', type: 'folder' }, { name: 'App.jsx', type: 'file', ext: 'jsx' },
  { name: 'api.js', type: 'file', ext: 'js' }, { name: 'tokens.css', type: 'file', ext: 'css' },
  { name: 'README.md', type: 'file', ext: 'md' }, { name: 'package.json', type: 'file', ext: 'json' },
];
const starterCode = {
  'App.jsx': `import React from 'react';\n\nexport default function App() {\n  return (\n    <main className="workspace">\n      <h1>Build with intention.</h1>\n      <p>Your next idea starts here.</p>\n    </main>\n  );\n}\n`,
  'api.js': `const API_BASE = '/api/v1';\n\nexport async function getHealth() {\n  const response = await fetch(\`${'${API_BASE}'}/health/live\`);\n  if (!response.ok) throw new Error('API unavailable');\n  return response.json();\n}\n`,
  'tokens.css': `:root {\n  --bg-base: #070A18;\n  --surface: #0D1428;\n  --violet: #8B5CF6;\n  --cyan: #22D3EE;\n  --gold: #F6C87A;\n  --text: #F7F7FB;\n}\n`,
  'README.md': `# Project workspace\n\nA focused development environment for reviewing files, planning changes and preparing code patches.\n\n> Execution is disabled in this UI preview. Use a verified isolated runner before executing untrusted code.\n`,
  'package.json': `{"name":"workspace-preview","private":true,"version":"0.1.0","scripts":{"dev":"vite","build":"vite build"}}`,
  'src': `// Select a file in the explorer to inspect its contents.\n`,
};

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { return {}; }
}
function Orb({ small = false }) {
  return <div className={`ba-orb ${small ? 'ba-orb--small' : ''}`} aria-hidden="true"><i className="ba-orb-ring ba-orb-ring--outer"/><i className="ba-orb-ring ba-orb-ring--inner"/><i className="ba-orb-core"><b/></i><i className="ba-orb-dot ba-orb-dot--one"/><i className="ba-orb-dot ba-orb-dot--two"/><i className="ba-orb-dot ba-orb-dot--three"/></div>;
}
function Brand({ compact = false }) {
  return <div className={`ba-brand ${compact ? 'ba-brand--compact' : ''}`}><img src="/brand/brahma-mark.svg" alt=""/><div><strong>BRAHMA</strong><span>Think Deeper · Create Faster · Build Bigger</span></div></div>;
}
function SectionTitle({ eyebrow, title, action, onAction }) {
  return <div className="ba-section-title"><div>{eyebrow && <span className="ba-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action && <button className="ba-text-button" onClick={onAction}>{action}<ArrowRight size={14}/></button>}</div>;
}
function EmptyPage({ page, onNewChat, onCreateProject, onNotice }) {
  const info = {
    research: ['Curiosity, with direction', 'Collect questions, organize evidence and build a clearer picture of any topic.', BrainCircuit],
    documents: ['From rough thought to clear story', 'Draft, edit and export notes in your workspace.', FileText],
    images: ['A space for visual exploration', 'Collect visual concepts and describe what you want to create.', ImageIcon],
    memory: ['A thoughtful memory space', 'Review local workspace preferences and saved notes.', BookOpen],
    agents: ['Focused helpers for focused work', 'Organize specialist roles around distinct tasks and outcomes.', Users],
  };
  const [title, text, Icon] = info[page] || info.research;
  return <div className="ba-empty-page"><div className="ba-empty-icon"><Icon size={23}/></div><span className="ba-eyebrow">BRAHMA WORKSPACE / {page.toUpperCase()}</span><h2>{title}<i>.</i></h2><p>{text}</p><div className="ba-empty-actions"><button className="ba-primary" onClick={() => page === 'documents' ? onNotice('Document workspace is ready for local notes. Use the editor below to draft content.') : page === 'agents' ? onNotice('Agent orchestration will be connected after the AI integration milestone.') : onNewChat()}><Plus size={15}/>{page === 'documents' ? 'Start a draft' : page === 'agents' ? 'Explore agents' : 'Start something new'}</button><button className="ba-secondary" onClick={() => page === 'research' ? onNotice('Research items can be added once the research API is connected.') : onCreateProject()}>Organize in a project <ArrowUpRight size={14}/></button></div></div>;
}

export function App() {
  const saved = useMemo(() => loadSaved(), []);
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState(saved.projects || seedProjects);
  const [conversations, setConversations] = useState(saved.conversations || seedConversations);
  const [activeConversation, setActiveConversation] = useState(null);
  const [draft, setDraft] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [astraTab, setAstraTab] = useState('editor');
  const [astraFile, setAstraFile] = useState('App.jsx');
  const [astraCode, setAstraCode] = useState(saved.astraCode || starterCode['App.jsx']);
  const [terminalLines, setTerminalLines] = useState(['ASTRA workspace initialized.', 'Execution is disabled in this frontend preview.', 'Connect a verified isolated runner before running commands.']);
  const [terminalDraft, setTerminalDraft] = useState('');
  const [reviewChecks, setReviewChecks] = useState([false, false, false]);
  const [documentText, setDocumentText] = useState(saved.documentText || '# Untitled document\n\nStart shaping your ideas here…');
  const [settings, setSettings] = useState(saved.settings || { compact: false, notifications: true, autosave: true });

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ projects, conversations, astraCode, documentText, settings })); } catch { /* storage may be unavailable */ }
  }, [projects, conversations, astraCode, documentText, settings]);

  const allNav = navGroups.flatMap(g => g.items);
  const filteredProjects = useMemo(() => projects.filter(p => `${p.title} ${p.type}`.toLowerCase().includes(query.toLowerCase())), [projects, query]);
  const filteredConversations = useMemo(() => conversations.filter(c => `${c.title} ${c.detail} ${c.tag}`.toLowerCase().includes(query.toLowerCase())), [conversations, query]);
  const go = (page) => { setActivePage(page); setMobileNav(false); setQuery(''); setNotice(''); };
  const newChat = () => { const item = { id: `c${Date.now()}`, title: 'New conversation', detail: 'A new thought with BRAHMA.', time: 'Just now', tag: 'Personal', messages: [] }; setConversations(prev => [item, ...prev]); setActiveConversation(item.id); setDraft(''); go('chat'); };
  const sendMessage = () => {
    const value = draft.trim(); if (!value) return;
    const id = activeConversation || conversations[0]?.id || `c${Date.now()}`;
    const found = conversations.find(c => c.id === id);
    const item = found || { id, title: value.slice(0, 56), detail: value, time: 'Just now', tag: 'Personal', messages: [] };
    const messages = [...(item.messages || []), { role: 'user', text: value, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    const updated = { ...item, title: item.title === 'New conversation' ? value.slice(0, 56) : item.title, detail: value, time: 'Just now', messages };
    setConversations(prev => prev.some(c => c.id === id) ? prev.map(c => c.id === id ? updated : c) : [updated, ...prev]);
    setActiveConversation(id); setDraft(''); setNotice('Message saved locally. Live AI responses will be enabled during provider integration.');
  };
  const createProject = () => {
    const title = projectName.trim(); if (!title) return;
    setProjects(prev => [{ id: `p${Date.now()}`, title, type: 'Personal project · Local workspace', color: 'violet', updated: 'Created just now', progress: 0 }, ...prev]);
    setProjectName(''); setShowProjectModal(false); go('projects'); setNotice('Project saved in this browser. Server synchronization is not connected yet.');
  };
  const exportWorkspace = () => {
    const blob = new Blob([JSON.stringify({ projects, conversations, documentText, astraCode, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'brahma-workspace-export.json'; a.click(); URL.revokeObjectURL(url); setNotice('Workspace export prepared.');
  };
  const runTerminalLine = () => {
    const command = terminalDraft.trim(); if (!command) return;
    setTerminalLines(prev => [...prev, `astra@workspace:~$ ${command}`, 'Command execution is intentionally disabled in this UI preview.', 'Connect ASTRA Runner only after verifying an isolated sandbox.']); setTerminalDraft('');
  };

  return <div className={`ba-app ${settings.compact ? 'ba-app--compact' : ''}`}>
    <div className={`ba-scrim ${mobileNav ? 'is-visible' : ''}`} onClick={() => setMobileNav(false)}/>
    <aside className={`ba-sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="ba-sidebar-top"><Brand/><button className="ba-icon-btn ba-mobile-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X size={17}/></button></div>
      <button className="ba-new-chat" onClick={newChat}><Plus size={16}/><span>New conversation</span><kbd><Command size={11}/> K</kbd></button>
      <nav className="ba-nav">{navGroups.map(group => <div className="ba-nav-group" key={group.label}><span className="ba-nav-label">{group.label}</span>{group.items.map(item => { const Icon = item.icon; return <button key={item.id} className={`ba-nav-item ${activePage === item.id ? 'is-active' : ''} ${item.special ? 'is-special' : ''}`} onClick={() => go(item.id)}><Icon size={17}/><span>{item.label}</span>{item.id === 'chat' && <small>{conversations.length}</small>}{item.special && <ArrowUpRight className="ba-nav-arrow" size={14}/>}</button>; })}</div>)}</nav>
      <div className="ba-sidebar-spacer"/>
      <div className="ba-sidebar-tip"><div className="ba-tip-icon"><Sparkles size={15}/></div><strong>Think beyond the obvious.</strong><p>Great work starts with a better question.</p><button onClick={() => go('research')}>Explore research <ArrowRight size={13}/></button></div>
      <button className="ba-settings-link" onClick={() => go('settings')}><Settings2 size={16}/>Settings <span><Command size={11}/> ,</span></button>
      <div className="ba-user-row"><div className="ba-avatar">A</div><div className="ba-user-copy"><strong>Your workspace</strong><span>Personal account · Local</span></div><button className="ba-icon-btn" aria-label="Profile menu" onClick={() => setProfileOpen(!profileOpen)}><MoreHorizontal size={18}/></button>{profileOpen && <div className="ba-popover ba-profile-pop"><strong>Personal workspace</strong><span>Data is currently stored in this browser.</span><button onClick={exportWorkspace}>Export workspace <Download size={13}/></button></div>}</div>
    </aside>

    <main className="ba-main">
      <header className="ba-topbar"><div className="ba-topbar-left"><button className="ba-icon-btn ba-menu-btn" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19}/></button><div className="ba-breadcrumb"><span>Workspace</span><ChevronRight size={13}/><strong>{allNav.find(i => i.id === activePage)?.label || (activePage === 'settings' ? 'Settings' : 'Workspace')}</strong></div></div><div className="ba-topbar-right"><label className="ba-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your workspace" aria-label="Search your workspace"/><kbd><Command size={10}/> K</kbd>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13}/></button>}</label><div className="ba-pop-wrap"><button className={`ba-icon-btn ${notificationsOpen ? 'is-pressed' : ''}`} aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={17}/><i/></button>{notificationsOpen && <div className="ba-popover ba-notice-pop"><strong>You're all caught up</strong><span>Workspace notifications will appear here.</span><button onClick={() => setNotificationsOpen(false)}>Close</button></div>}</div><button className="ba-help-btn" onClick={() => setNotice('BRAHMA help: your local workspace is ready. Live AI and server sync are planned for integration milestones.')}><CircleHelp size={16}/></button></div></header>
      <div className="ba-content">
        {notice && <div className="ba-inline-notice"><Check size={15}/><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14}/></button></div>}

        {activePage === 'dashboard' && <>
          <section className="ba-welcome"><div className="ba-welcome-copy"><div className="ba-eyebrow"><span className="ba-live-dot"/> YOUR INTELLIGENCE SPACE</div><h1>Good to see you<span>.</span></h1><p>A little clarity can change everything. What would you like to explore today?</p><div className="ba-welcome-actions"><button className="ba-primary" onClick={newChat}><Sparkles size={16}/>Start a conversation <ArrowUpRight size={15}/></button><button className="ba-secondary" onClick={() => setShowProjectModal(true)}><Plus size={15}/>New project</button></div></div><div className="ba-welcome-art"><div className="ba-art-label ba-art-label--top">BRAHMA CORE <span>· 001</span></div><Orb/><div className="ba-art-label ba-art-label--bottom"><span className="ba-status-dot"/> READY WHEN YOU ARE</div></div><div className="ba-welcome-glow"/></section>
          <section className="ba-quick-section"><SectionTitle eyebrow="A GOOD PLACE TO BEGIN" title="Make something happen"/><div className="ba-quick-grid">{quickActions.map(a => {const Icon = a.icon;return <button className="ba-quick-card" key={a.id} onClick={() => a.id === 'chat' ? newChat() : go(a.id)}><span className={`ba-quick-icon tone-${a.color}`}><Icon size={18}/></span><span className="ba-quick-card-title">{a.title}</span><span className="ba-quick-card-text">{a.text}</span><ArrowUpRight className="ba-quick-arrow" size={15}/></button>;})}</div></section>
          <div className="ba-lower-grid"><section className="ba-panel"><SectionTitle eyebrow="YOUR WORK IN MOTION" title="Recent projects" action="All projects" onAction={() => go('projects')}/><div className="ba-project-list">{filteredProjects.slice(0, 3).map(p => <button className="ba-project-row" key={p.id} onClick={() => {go('projects');setNotice(`${p.title} opened in the project list.`)}}><span className={`ba-project-icon tone-${p.color}`}><FolderKanban size={17}/></span><span className="ba-project-info"><strong>{p.title}</strong><small>{p.type}</small><span className="ba-progress"><i style={{ width: `${p.progress}%` }}/></span></span><span className="ba-project-updated">{p.updated}</span><ChevronRight size={15}/></button>)}{!filteredProjects.length && <div className="ba-no-results">No projects match “{query}”.</div>}</div><button className="ba-add-project" onClick={() => setShowProjectModal(true)}><Plus size={15}/> Create a project <span>Start with a clear goal</span></button></section>
          <section className="ba-panel"><SectionTitle eyebrow="PICK UP WHERE YOU LEFT OFF" title="Recent conversations" action="View all" onAction={() => go('chat')}/><div className="ba-conversation-list">{filteredConversations.slice(0, 3).map(c => <button className="ba-conversation-row" key={c.id} onClick={() => {setActiveConversation(c.id);go('chat')}}><span className="ba-conversation-mark"><MessageSquare size={15}/></span><span className="ba-conversation-info"><strong>{c.title}</strong><small>{c.detail}</small><span><i>{c.tag}</i><em><Clock3 size={11}/>{c.time}</em></span></span><ChevronRight size={15}/></button>)}{!filteredConversations.length && <div className="ba-no-results">No conversations match “{query}”.</div>}</div></section></div>
          <section className="ba-bottom-strip"><div className="ba-bottom-icon"><ShieldCheck size={18}/></div><div><strong>Your space, thoughtfully designed.</strong><p>Milestones 1–4 provide a local frontend foundation. Live AI and backend persistence require the next integration phase.</p></div><span className="ba-foundation-pill"><i/> LOCAL WORKSPACE</span></section>
        </>}

        {activePage === 'projects' && <section className="ba-page"><div className="ba-page-heading"><div><span className="ba-eyebrow">ORGANIZE YOUR THINKING</span><h1>Projects<span>.</span></h1><p>Keep related conversations and work in one place.</p></div><button className="ba-primary" onClick={() => setShowProjectModal(true)}><Plus size={15}/> Create project</button></div><div className="ba-project-toolbar"><span>{filteredProjects.length} projects</span><button className="ba-secondary" onClick={exportWorkspace}><Download size={14}/> Export workspace</button></div><div className="ba-project-cards">{filteredProjects.map(p => <article className="ba-project-large" key={p.id}><div className="ba-project-large-top"><span className={`ba-project-icon tone-${p.color}`}><FolderKanban size={18}/></span><span className="ba-mini-status"><Circle size={7}/> Local</span></div><strong>{p.title}</strong><p>{p.type}</p><div className="ba-project-large-progress"><span><small>Progress</small><b>{p.progress}%</b></span><i><em style={{ width: `${p.progress}%` }}/></i></div><div className="ba-project-card-actions"><button onClick={() => {setActiveConversation(null);go('chat');setNotice(`Start a conversation about ${p.title}.`)}}>Discuss project <ArrowUpRight size={13}/></button><button aria-label={`Delete ${p.title}`} onClick={() => setProjects(prev => prev.filter(x => x.id !== p.id))}><X size={14}/></button></div></article>)}{!filteredProjects.length && <div className="ba-no-results">No projects match your search. Try a different query or create a project.</div>}</div></section>}

        {activePage === 'chat' && <section className="ba-chat-page"><div className="ba-page-heading"><div><span className="ba-eyebrow">BRAHMA CONVERSATIONS / LOCAL</span><h1>Conversations<span>.</span></h1><p>Your messages are saved locally in this browser; live model responses are not connected yet.</p></div><button className="ba-secondary" onClick={newChat}><Plus size={15}/> New conversation</button></div><div className="ba-chat-layout"><aside className="ba-chat-list">{filteredConversations.map(c => <button key={c.id} className={`ba-chat-list-item ${activeConversation === c.id ? 'is-active' : ''}`} onClick={() => setActiveConversation(c.id)}><MessageSquare size={15}/><span><strong>{c.title}</strong><small>{c.time}</small></span></button>)}{!filteredConversations.length && <p className="ba-muted-note">No conversations found.</p>}</aside><div className="ba-chat-thread">{(() => { const c = conversations.find(x => x.id === activeConversation) || conversations[0]; return c ? <><div className="ba-thread-heading"><div className="ba-thread-orb"><Orb small/></div><div><strong>{c.title}</strong><span>Local conversation · No AI provider connected</span></div></div><div className="ba-message-list">{(c.messages || []).length ? c.messages.map((m, i) => <div className={`ba-message ba-message--${m.role}`} key={`${m.time}-${i}`}><span>{m.role === 'user' ? 'YOU' : 'BRAHMA'}</span><p>{m.text}</p><small>{m.time}</small></div>) : <div className="ba-thread-empty"><Orb small/><h2>What would you like to think through?</h2><p>Write a message below. It will be saved locally until AI integration is connected.</p></div>}</div><div className="ba-chat-composer"><textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write a message to save in this conversation…" rows={3} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}/><div><span><ShieldCheck size={13}/> Local-only · Enter to save</span><button className="ba-primary" onClick={sendMessage} disabled={!draft.trim()}>Save message <Send size={14}/></button></div></div></> : <div className="ba-thread-empty"><MessageSquare size={26}/><h2>Start a conversation</h2><button className="ba-primary" onClick={newChat}><Plus size={15}/> New conversation</button></div>; })()}</div></div></section>}

        {activePage === 'astra' && <section className="ba-astra-page"><div className="ba-astra-heading"><div className="ba-astra-brand"><img src="/brand/astra-mark.svg" alt="ASTRA"/><div><span>CODE · CREATE · DEPLOY</span><h1>ASTRA <i>Workspace</i></h1><p>A focused coding environment for exploration, review and deliberate changes.</p></div></div><div className="ba-astra-status"><span/><div><strong>Workspace ready</strong><small>Execution locked · Local preview</small></div></div></div><div className="ba-astra-toolbar"><div className="ba-astra-tabs">{[{id:'editor',label:'Editor',icon:Code2},{id:'terminal',label:'Terminal',icon:Terminal},{id:'review',label:'Patch review',icon:GitBranch}].map(t => {const Icon=t.icon;return <button key={t.id} className={astraTab===t.id?'is-active':''} onClick={() => setAstraTab(t.id)}><Icon size={14}/>{t.label}</button>})}</div><div className="ba-astra-actions"><span className="ba-branch-label"><GitBranch size={13}/> main</span><button className="ba-secondary" onClick={() => {setAstraCode(starterCode[astraFile] || starterCode['App.jsx']);setNotice('Selected file reset to the sample starter content.')}}><RotateCcw size={13}/> Reset file</button><button className="ba-primary" onClick={() => {try{localStorage.setItem(STORAGE,JSON.stringify({...loadSaved(),astraCode}));setNotice('Editor content saved locally.')}catch{setNotice('Could not save editor content in local storage.')}}}><Save size={14}/> Save</button></div></div><div className="ba-astra-workbench"><aside className="ba-file-explorer"><div className="ba-pane-title"><span>EXPLORER</span><MoreHorizontal size={15}/></div><div className="ba-file-root"><ChevronDown size={13}/><Folder size={14}/> BRAHMA-PROJECT</div>{starterFiles.map(f => <button key={f.name} className={`ba-file-item ${astraFile===f.name?'is-active':''} ${f.type==='folder'?'is-folder':''}`} onClick={() => {if(f.type==='file'){setAstraFile(f.name);setAstraCode(starterCode[f.name] || `// ${f.name}\n`);setAstraTab('editor')}}}>{f.type==='folder'?<Folder size={14}/>:f.ext==='css'?<FileText size={14}/>:f.ext==='md'?<FileText size={14}/>:f.ext==='json'?<File size={14}/>:<FileCode2 size={14}/>}<span>{f.name}</span>{f.name==='App.jsx'&&<i/>}</button>)}<div className="ba-explorer-note"><ShieldCheck size={14}/><span>Safe preview mode<br/>No local commands are executed.</span></div></aside><div className="ba-editor-area">{astraTab==='editor' && <><div className="ba-editor-tab"><FileCode2 size={14}/>{astraFile}<span>●</span><button onClick={() => setNotice('Editor content is saved locally when you press Save.')} aria-label="Editor information"><CircleHelp size={13}/></button></div><div className="ba-code-editor"><div className="ba-line-numbers">{astraCode.split('\n').map((_,i)=><span key={i}>{i+1}</span>)}</div><textarea spellCheck="false" aria-label="Code editor" value={astraCode} onChange={e=>setAstraCode(e.target.value)} /></div><div className="ba-editor-status"><span><GitBranch size={12}/> main</span><span>UTF-8</span><span>JavaScript / editable sample</span><span>{astraCode.split('\n').length} lines</span></div></>}{astraTab==='terminal' && <div className="ba-terminal-panel"><div className="ba-pane-title"><span><Terminal size={13}/> TERMINAL PREVIEW</span><span className="ba-lock-pill"><ShieldCheck size={12}/> EXECUTION DISABLED</span></div><div className="ba-terminal-output">{terminalLines.map((line,i)=><p key={i} className={line.includes('$')?'ba-terminal-command':''}>{line}</p>)}</div><form className="ba-terminal-input" onSubmit={e=>{e.preventDefault();runTerminalLine()}}><span>astra@workspace:~$</span><input value={terminalDraft} onChange={e=>setTerminalDraft(e.target.value)} placeholder="Type to preview a command (not executed)…"/><button className="ba-secondary" type="submit">Submit</button></form></div>}{astraTab==='review' && <div className="ba-review-panel"><div className="ba-pane-title"><span><GitBranch size={13}/> CHANGE REVIEW CHECKLIST</span><span className="ba-review-count">{reviewChecks.filter(Boolean).length}/3 checked</span></div><div className="ba-review-intro"><div className="ba-review-icon"><ShieldCheck size={22}/></div><h2>Review before you merge.</h2><p>Use this checklist to think through code changes. No real Git repository or patch is connected in this milestone.</p></div>{['I understand the purpose and scope of this change.','I reviewed error handling, input validation and edge cases.','I checked security implications and added appropriate tests.'].map((item,i)=><label className="ba-review-check" key={item}><input type="checkbox" checked={reviewChecks[i]} onChange={e=>setReviewChecks(prev=>prev.map((v,j)=>i===j?e.target.checked:v))}/><span>{reviewChecks[i]?<CheckCircle2 size={17}/>:<Circle size={17}/>}</span>{item}</label>)}<button className="ba-secondary" onClick={()=>setNotice(reviewChecks.every(Boolean)?'All review checklist items are checked. This is not a substitute for automated tests.':'Complete the checklist before marking the review ready.')}><Check size={14}/> Validate checklist</button></div>}</div></div><div className="ba-astra-footnote"><ShieldCheck size={14}/> ASTRA Runner is not connected. Code execution, filesystem access and shell commands remain disabled for safety.</div></section>}

        {activePage === 'documents' && <section className="ba-page"><div className="ba-page-heading"><div><span className="ba-eyebrow">CREATE & DISCOVER</span><h1>Documents<span>.</span></h1><p>Draft and keep notes in your local workspace.</p></div><button className="ba-primary" onClick={() => {setDocumentText('# Untitled document\n\n');setNotice('Started a fresh local document.')}}><Plus size={15}/> New document</button></div><div className="ba-document-editor"><div className="ba-document-toolbar"><span><FileText size={14}/> Untitled document</span><button className="ba-secondary" onClick={() => {const blob=new Blob([documentText],{type:'text/markdown'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='brahma-document.md';a.click();URL.revokeObjectURL(url);setNotice('Markdown document exported.')}}><Download size={14}/> Export .md</button></div><textarea value={documentText} onChange={e=>setDocumentText(e.target.value)} spellCheck="false" aria-label="Document editor"/><div className="ba-document-foot"><span><Save size={12}/> Saved locally in this browser</span><span>{documentText.length} characters</span></div></div></section>}

        {activePage === 'settings' && <section className="ba-page"><div className="ba-page-heading"><div><span className="ba-eyebrow">PREFERENCES</span><h1>Settings<span>.</span></h1><p>Adjust this browser's local workspace preferences.</p></div><button className="ba-secondary" onClick={exportWorkspace}><Download size={14}/> Export data</button></div><div className="ba-settings-card"><div className="ba-settings-row"><div><strong>Compact workspace</strong><p>Reduce spacing across workspace panels.</p></div><input type="checkbox" checked={settings.compact} onChange={e=>setSettings(prev=>({...prev,compact:e.target.checked}))}/></div><div className="ba-settings-row"><div><strong>Notifications</strong><p>Show notification indicator in the top bar.</p></div><input type="checkbox" checked={settings.notifications} onChange={e=>setSettings(prev=>({...prev,notifications:e.target.checked}))}/></div><div className="ba-settings-row"><div><strong>Local autosave</strong><p>Save projects, drafts and editor content in browser storage.</p></div><input type="checkbox" checked={settings.autosave} onChange={e=>setSettings(prev=>({...prev,autosave:e.target.checked}))}/></div><div className="ba-settings-row"><div><strong>Clear local workspace</strong><p>Remove local project and conversation data from this browser.</p></div><button className="ba-danger-button" onClick={()=>{if(window.confirm('Clear local workspace data? This cannot be undone.')){localStorage.removeItem(STORAGE);setProjects(seedProjects);setConversations(seedConversations);setDocumentText('# Untitled document\n\n');setAstraCode(starterCode['App.jsx']);setNotice('Local workspace data reset.')}}}>Reset data</button></div></div></section>}

        {['research','images','memory','agents'].includes(activePage) && <section className="ba-page"><div className="ba-page-heading"><div><span className="ba-eyebrow">BRAHMA WORKSPACE / V1</span><h1>{allNav.find(i=>i.id===activePage)?.label}<span>.</span></h1><p>Explore a dedicated space for this part of your workflow.</p></div><button className="ba-secondary" onClick={exportWorkspace}><Download size={14}/> Export workspace</button></div><EmptyPage page={activePage} onNewChat={newChat} onCreateProject={()=>setShowProjectModal(true)} onNotice={setNotice}/></section>}

        <footer className="ba-footer"><span>© BRAHMA · YOUR INTELLIGENCE SPACE</span><span><i/> Local systems ready <b>·</b> v1.0 / MILESTONES 1–4</span></footer>
      </div>
    </main>

    {showProjectModal && <div className="ba-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowProjectModal(false)}}><section className="ba-modal" role="dialog" aria-modal="true" aria-labelledby="ba-modal-title"><div className="ba-modal-top"><span className="ba-modal-icon"><FolderKanban size={19}/></span><button className="ba-icon-btn" aria-label="Close dialog" onClick={()=>setShowProjectModal(false)}><X size={17}/></button></div><span className="ba-eyebrow">MAKE SPACE FOR AN IDEA</span><h2 id="ba-modal-title">Create a project</h2><p>Give your work a name. It will be saved locally in this browser.</p><label className="ba-field-label" htmlFor="ba-project-name">Project name</label><input id="ba-project-name" autoFocus value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="e.g. Personal knowledge system" onKeyDown={e=>{if(e.key==='Enter')createProject()}}/><div className="ba-modal-actions"><button className="ba-secondary" onClick={()=>setShowProjectModal(false)}>Cancel</button><button className="ba-primary" onClick={createProject} disabled={!projectName.trim()}><Plus size={15}/> Create project</button></div><small className="ba-modal-footnote">Local browser storage · No server synchronization</small></section></div>}
  </div>;
}
