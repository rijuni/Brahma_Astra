import React, { useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Atom, Bell, BookOpen,
  BrainCircuit, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Command,
  FileText, FolderKanban, Gauge, Image as ImageIcon, LayoutDashboard, Lightbulb,
  Menu, MessageSquare, MoreHorizontal, Plus, Search, Send, Settings2, ShieldCheck,
  Sparkles, Star, TerminalSquare, Users, WandSparkles, X, Zap
} from 'lucide-react';
import './App.css';

const navGroups = [
  { label: 'WORKSPACE', items: [
    { id: 'dashboard', label: 'Home dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Conversations', icon: MessageSquare, count: '4' },
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
const projects = [
  { title: 'Radiology Intelligence', type: 'Healthcare · AI research', icon: Activity, color: 'violet', updated: 'Updated 18 min ago', progress: 72 },
  { title: 'BRAHMA Core', type: 'Platform · Engineering', icon: Atom, color: 'gold', updated: 'Updated yesterday', progress: 48 },
  { title: 'Knowledge Atlas', type: 'Research · Knowledge base', icon: BookOpen, color: 'cyan', updated: 'Updated 2 days ago', progress: 86 },
];
const conversations = [
  { title: 'Designing the next generation of clinical AI', detail: 'Help me map the next iteration of the radiology intelligence workspace.', time: '12 min ago', tag: 'Healthcare' },
  { title: 'ASTRA runner security checklist', detail: 'Review the isolation boundary and execution policy before enabling runs.', time: 'Yesterday', tag: 'Engineering' },
  { title: 'Research synthesis — multimodal models', detail: 'Compare current approaches and identify a practical evaluation plan.', time: 'Oct 14', tag: 'Research' },
];
const quickActions = [
  { id: 'chat', title: 'Start a conversation', text: 'Think through an idea with BRAHMA.', icon: MessageSquare, color: 'violet' },
  { id: 'research', title: 'Explore a topic', text: 'Turn questions into structured insight.', icon: BrainCircuit, color: 'cyan' },
  { id: 'documents', title: 'Create a document', text: 'Shape your thoughts into something clear.', icon: FileText, color: 'gold' },
  { id: 'astra', title: 'Build with ASTRA', text: 'Enter your focused coding workspace.', icon: TerminalSquare, color: 'blue' },
];

function Brand({ compact = false }) {
  return <div className={`m2-brand ${compact ? 'm2-brand--compact' : ''}`}>
    <img src="/brand/brahma-mark.svg" alt="" />
    <div><strong>BRAHMA</strong><span>Think Deeper · Create Faster · Build Bigger</span></div>
  </div>;
}
function OrbMark() { return <div className="m2-orb" aria-hidden="true"><div className="m2-orb__ring m2-orb__ring--outer"/><div className="m2-orb__ring m2-orb__ring--inner"/><div className="m2-orb__core"><span/></div><i className="m2-orb__dot m2-orb__dot--a"/><i className="m2-orb__dot m2-orb__dot--b"/><i className="m2-orb__dot m2-orb__dot--c"/></div>; }
function SectionTitle({ eyebrow, title, action, onAction }) { return <div className="m2-section-title"><div>{eyebrow && <span className="m2-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action && <button className="m2-text-button" onClick={onAction}>{action}<ArrowRight size={14}/></button>}</div>; }
function EmptyWorkspace({ page, onNewChat, onCreateProject }) {
  const content = {
    chat: { icon: MessageSquare, title: 'Your conversations, in one place', text: 'Start a fresh thought or return to a conversation you were shaping.' },
    projects: { icon: FolderKanban, title: 'Make room for big ideas', text: 'Projects keep conversations, research and work organized around a goal.' },
    research: { icon: BrainCircuit, title: 'Curiosity, with direction', text: 'Collect questions, organize evidence and build a clearer picture of any topic.' },
    documents: { icon: FileText, title: 'From rough thought to clear story', text: 'Create a structured draft, outline or working document with BRAHMA.' },
    images: { icon: ImageIcon, title: 'A space for visual exploration', text: 'Plan concepts and creative directions for your next visual project.' },
    memory: { icon: BookOpen, title: 'A thoughtful memory space', text: 'Review the preferences and knowledge you choose to make available.' },
    agents: { icon: Users, title: 'Bring focused helpers into your workflow', text: 'Organize specialist agents around distinct tasks and outcomes.' },
    astra: { icon: TerminalSquare, title: 'ASTRA · Code · Create · Deploy', text: 'Your dedicated coding workspace is the next build milestone. This entry is a frontend placeholder for now.' },
  };
  const item = content[page] || content.chat; const Icon = item.icon;
  return <div className="m2-empty-page"><div className="m2-empty-icon"><Icon size={24}/></div><span className="m2-eyebrow">WORKSPACE / {page.toUpperCase()}</span><h2>{item.title}</h2><p>{item.text}</p><div className="m2-empty-actions"><button className="m2-primary" onClick={page === 'projects' ? onCreateProject : onNewChat}><Plus size={16}/>{page === 'projects' ? 'Create a project' : page === 'astra' ? 'View build roadmap' : 'Start something new'}</button><button className="m2-secondary" onClick={onNewChat}>Open conversation <ArrowUpRight size={15}/></button></div></div>;
}

export function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectList, setProjectList] = useState(projects);
  const [notice, setNotice] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const filteredProjects = useMemo(() => projectList.filter(p => `${p.title} ${p.type}`.toLowerCase().includes(query.toLowerCase())), [projectList, query]);
  const filteredConversations = useMemo(() => conversations.filter(c => `${c.title} ${c.detail} ${c.tag}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const go = (page) => { setActivePage(page); setMobileNav(false); setQuery(''); setNotice(''); };
  const newChat = () => { setActivePage('chat'); setShowComposer(true); setDraft(''); setMobileNav(false); };
  const sendDraft = () => { if (!draft.trim()) return; setNotice(`Draft started: “${draft.trim().slice(0, 72)}${draft.trim().length > 72 ? '…' : ''}”`); setShowComposer(false); setActivePage('chat'); setDraft(''); };
  const createProject = () => { if (!projectName.trim()) return; setProjectList([{ title: projectName.trim(), type: 'Personal project · Just created', icon: FolderKanban, color: 'violet', updated: 'Created just now', progress: 0 }, ...projectList]); setProjectName(''); setShowProjectModal(false); go('projects'); setNotice('Project created locally. Backend persistence is not connected in this milestone.'); };

  return <div className="m2-app">
    <div className={`m2-sidebar-scrim ${mobileNav ? 'is-visible' : ''}`} onClick={() => setMobileNav(false)} />
    <aside className={`m2-sidebar ${mobileNav ? 'is-open' : ''}`}>
      <div className="m2-sidebar-top"><Brand/><button className="m2-icon-btn m2-mobile-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X size={17}/></button></div>
      <button className="m2-new-chat" onClick={newChat}><Plus size={16}/><span>New conversation</span><kbd>⌘ K</kbd></button>
      <nav className="m2-nav">{navGroups.map(group => <div className="m2-nav-group" key={group.label}><span className="m2-nav-label">{group.label}</span>{group.items.map(item => { const Icon = item.icon; return <button key={item.id} className={`m2-nav-item ${activePage === item.id ? 'is-active' : ''} ${item.special ? 'is-special' : ''}`} onClick={() => go(item.id)}><Icon size={17}/><span>{item.label}</span>{item.count && <small>{item.count}</small>}{item.special && <ArrowUpRight className="m2-nav-arrow" size={14}/>}</button>; })}</div>)}</nav>
      <div className="m2-sidebar-spacer"/>
      <div className="m2-sidebar-tip"><div className="m2-tip-icon"><Sparkles size={15}/></div><strong>Think beyond the obvious.</strong><p>Great work starts with a better question.</p><button onClick={() => go('research')}>Explore research <ArrowRight size={13}/></button></div>
      <button className="m2-settings-link" onClick={() => setNotice('Settings will be implemented in a later milestone.')}><Settings2 size={16}/>Settings <span>⌘ ,</span></button>
      <div className="m2-user-row"><div className="m2-avatar">A</div><div className="m2-user-copy"><strong>Your workspace</strong><span>Personal account</span></div><button className="m2-icon-btn" aria-label="Profile menu" onClick={() => setProfileOpen(!profileOpen)}><MoreHorizontal size={18}/></button>{profileOpen && <div className="m2-popover m2-profile-pop"><strong>Personal workspace</strong><span>Account settings arrive in a later milestone.</span><button onClick={() => {setProfileOpen(false);setNotice('Profile settings are not connected yet.')}}>Manage profile <ArrowRight size={13}/></button></div>}</div>
    </aside>

    <main className="m2-main">
      <header className="m2-topbar"><div className="m2-topbar-left"><button className="m2-icon-btn m2-menu-btn" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19}/></button><div className="m2-breadcrumb"><span>Workspace</span><ChevronRight size={13}/><strong>{navGroups.flatMap(g => g.items).find(i => i.id === activePage)?.label || 'Home dashboard'}</strong></div></div><div className="m2-topbar-right"><label className="m2-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your workspace" aria-label="Search your workspace"/><kbd>⌘ K</kbd>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13}/></button>}</label><div className="m2-pop-wrap"><button className={`m2-icon-btn ${notificationsOpen ? 'is-pressed' : ''}`} aria-label="Notifications" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={17}/><i/></button>{notificationsOpen && <div className="m2-popover m2-notice-pop"><strong>You're all caught up</strong><span>Important updates will appear here when notifications are connected.</span><button onClick={() => setNotificationsOpen(false)}>Close</button></div>}</div><button className="m2-help-btn" onClick={() => setNotice('BRAHMA help centre will be connected in a later milestone.')}><CircleHelp size={16}/></button></div></header>
      <div className="m2-content">
        {notice && <div className="m2-inline-notice"><Check size={15}/><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14}/></button></div>}
        {activePage === 'dashboard' ? <>
          <section className="m2-welcome"><div className="m2-welcome-copy"><div className="m2-eyebrow"><span className="m2-live-dot"/> YOUR INTELLIGENCE SPACE</div><h1>Good to see you<span className="m2-gold-dot">.</span></h1><p>A little clarity can change everything. What would you like to explore today?</p><div className="m2-welcome-actions"><button className="m2-primary" onClick={newChat}><Sparkles size={16}/>Start a conversation <ArrowUpRight size={15}/></button><button className="m2-secondary" onClick={() => setShowProjectModal(true)}><Plus size={15}/>New project</button></div></div><div className="m2-welcome-art"><div className="m2-art-label m2-art-label--top">BRAHMA CORE <span>· 001</span></div><OrbMark/><div className="m2-art-label m2-art-label--bottom"><span className="m2-status-dot"/> READY WHEN YOU ARE</div></div><div className="m2-welcome-glow"/></section>
          <section className="m2-quick-section"><SectionTitle eyebrow="A GOOD PLACE TO BEGIN" title="Make something happen"/><div className="m2-quick-grid">{quickActions.map(a => {const Icon = a.icon;return <button className="m2-quick-card" key={a.id} onClick={() => a.id === 'chat' ? newChat() : go(a.id)}><span className={`m2-quick-icon tone-${a.color}`}><Icon size={18}/></span><span className="m2-quick-card-title">{a.title}</span><span className="m2-quick-card-text">{a.text}</span><ArrowUpRight className="m2-quick-arrow" size={15}/></button>;})}</div></section>
          <div className="m2-lower-grid"><section className="m2-panel m2-project-panel"><SectionTitle eyebrow="YOUR WORK IN MOTION" title="Recent projects" action="All projects" onAction={() => go('projects')}/><div className="m2-project-list">{filteredProjects.slice(0,3).map((p, i) => {const Icon = p.icon;return <button className="m2-project-row" key={`${p.title}-${i}`} onClick={() => {go('projects');setNotice(`${p.title} selected. Project details will be added in a later milestone.`)}}><span className={`m2-project-icon tone-${p.color}`}><Icon size={17}/></span><span className="m2-project-info"><strong>{p.title}</strong><small>{p.type}</small><span className="m2-progress"><i style={{width:`${p.progress}%`}}/></span></span><span className="m2-project-updated">{p.updated}</span><ChevronRight size={15}/></button>;})}{filteredProjects.length === 0 && <div className="m2-no-results">No projects match “{query}”.</div>}</div><button className="m2-add-project" onClick={() => setShowProjectModal(true)}><Plus size={15}/> Create a project <span>Start with a clear goal</span></button></section>
          <section className="m2-panel m2-conversation-panel"><SectionTitle eyebrow="PICK UP WHERE YOU LEFT OFF" title="Recent conversations" action="View all" onAction={() => go('chat')}/><div className="m2-conversation-list">{filteredConversations.slice(0,3).map((c,i) => <button className="m2-conversation-row" key={c.title} onClick={() => {go('chat');setNotice(`Opened conversation preview: ${c.title}. Conversation persistence will be connected in a later milestone.`)}}><span className="m2-conversation-mark"><MessageSquare size={15}/></span><span className="m2-conversation-info"><strong>{c.title}</strong><small>{c.detail}</small><span><i>{c.tag}</i><em><Clock3 size={11}/>{c.time}</em></span></span><ChevronRight size={15}/></button>)}{filteredConversations.length === 0 && <div className="m2-no-results">No conversations match “{query}”.</div>}</div></section></div>
          <section className="m2-bottom-strip"><div className="m2-bottom-icon"><ShieldCheck size={18}/></div><div><strong>Your space, thoughtfully designed.</strong><p>Your work stays organized around your ideas. Connections and persistence will be enabled in upcoming milestones.</p></div><span className="m2-foundation-pill"><i/> FOUNDATION READY</span></section>
        </> : <><div className="m2-page-heading"><div><span className="m2-eyebrow">BRAHMA WORKSPACE / V1</span><h1>{navGroups.flatMap(g => g.items).find(i => i.id === activePage)?.label || 'Workspace'}<span className="m2-gold-dot">.</span></h1><p>One thoughtful space for your ideas, work and discovery.</p></div><button className="m2-secondary" onClick={() => go('dashboard')}><LayoutDashboard size={15}/> Back to dashboard</button></div>{activePage === 'projects' ? <div className="m2-projects-page"><div className="m2-project-page-toolbar"><span>{filteredProjects.length} projects</span><button className="m2-primary" onClick={() => setShowProjectModal(true)}><Plus size={15}/> Create project</button></div><div className="m2-project-cards">{filteredProjects.map((p,i)=>{const Icon=p.icon;return <button key={`${p.title}-${i}`} className="m2-project-large" onClick={()=>setNotice(`${p.title} selected. Project details will be built next.`)}><div className="m2-project-large-top"><span className={`m2-project-icon tone-${p.color}`}><Icon size={18}/></span><MoreHorizontal size={17}/></div><strong>{p.title}</strong><p>{p.type}</p><div className="m2-project-large-progress"><span><small>Progress</small><b>{p.progress}%</b></span><i><em style={{width:`${p.progress}%`}}/></i></div><small className="m2-project-large-updated"><Clock3 size={12}/>{p.updated}</small></button>})}</div></div> : activePage === 'chat' && showComposer ? <div className="m2-composer-page"><div className="m2-composer-orb"><OrbMark/></div><span className="m2-eyebrow">A NEW CONVERSATION</span><h2>What’s on your mind?</h2><p>Start with a question, an idea or something you want to understand.</p><div className="m2-composer-box"><textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Ask BRAHMA anything…" rows={4} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendDraft()}}}/><div><span><Sparkles size={13}/> Thoughtful by design</span><button className="m2-primary" onClick={sendDraft} disabled={!draft.trim()}>Start thinking <Send size={14}/></button></div></div><button className="m2-text-button" onClick={()=>setShowComposer(false)}>Cancel <X size={14}/></button></div> : <EmptyWorkspace page={activePage} onNewChat={newChat} onCreateProject={()=>setShowProjectModal(true)}/>}</>}
        <footer className="m2-footer"><span>© BRAHMA · YOUR INTELLIGENCE SPACE</span><span><i/> Systems nominal <b>·</b> v1.0 / MILESTONE 2</span></footer>
      </div>
    </main>
    {showProjectModal && <div className="m2-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowProjectModal(false)}}><section className="m2-modal" role="dialog" aria-modal="true" aria-labelledby="m2-modal-title"><div className="m2-modal-top"><span className="m2-modal-icon"><FolderKanban size={19}/></span><button className="m2-icon-btn" aria-label="Close dialog" onClick={()=>setShowProjectModal(false)}><X size={17}/></button></div><span className="m2-eyebrow">MAKE SPACE FOR AN IDEA</span><h2 id="m2-modal-title">Create a project</h2><p>Give your work a name. You can shape the details as it grows.</p><label className="m2-field-label" htmlFor="m2-project-name">Project name</label><input id="m2-project-name" autoFocus value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="e.g. Personal knowledge system" onKeyDown={e=>{if(e.key==='Enter')createProject()}}/><div className="m2-modal-actions"><button className="m2-secondary" onClick={()=>setShowProjectModal(false)}>Cancel</button><button className="m2-primary" onClick={createProject} disabled={!projectName.trim()}><Plus size={15}/> Create project</button></div><small className="m2-modal-footnote">Milestone 2 preview · Stored in this browser session only</small></section></div>}
  </div>;
}
