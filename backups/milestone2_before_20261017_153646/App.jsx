import React, { useState } from 'react';
import './App.css';
import { ArrowUpRight, Atom, AudioWaveform, Check, ChevronRight, CircleHelp, Command, Cpu, Layers3, Moon, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Cosmic depth', text: 'Layered atmosphere, soft aurora gradients and controlled ambient light.' },
  { icon: Layers3, title: 'Glass surfaces', text: 'Translucent panels with subtle borders, real depth and readable contrast.' },
  { icon: AudioWaveform, title: 'Motion language', text: 'Small purposeful transitions, reduced-motion support and no distracting flashes.' },
];

function Brand({ astra = false }) {
  return <div className={`brand-lockup ${astra ? 'brand-lockup--astra' : ''}`}>
    <img src={astra ? '/brand/astra-mark.svg' : '/brand/brahma-mark.svg'} alt="" />
    <div><strong>{astra ? 'ASTRA' : 'BRAHMA'}</strong><span>{astra ? 'CODE · CREATE · DEPLOY' : 'Think Deeper • Create Faster • Build Bigger'}</span></div>
  </div>;
}

function Orb() {
  return <div className="orb-stage" aria-label="BRAHMA ambient intelligence orb">
    <div className="orb-halo orb-halo--one" /><div className="orb-halo orb-halo--two" />
    <div className="orb-ring orb-ring--outer" /><div className="orb-ring orb-ring--inner" />
    <div className="orb-core"><div className="orb-core__shine" /><div className="orb-core__spark" /></div>
    <div className="orb-particle orb-particle--one" /><div className="orb-particle orb-particle--two" /><div className="orb-particle orb-particle--three" />
  </div>;
}

export function App() {
  const [product, setProduct] = useState('brahma');
  const [copied, setCopied] = useState(false);
  const isAstra = product === 'astra';
  const copyToken = async () => {
    try { await navigator.clipboard.writeText(isAstra ? '#070A18 · #0D1428 · #101B35' : '#0B0F1A · #111827 · #1E1B3D'); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } catch { setCopied(false); }
  };

  return <main className={`app-shell ${isAstra ? 'app-shell--astra' : ''}`} data-product={product}>
    <div className="cosmos cosmos--left" /><div className="cosmos cosmos--right" /><div className="starfield" />
    <header className="topbar">
      <Brand astra={isAstra} />
      <div className="topbar__right"><span className="build-pill"><i /> FOUNDATION / MILESTONE 1</span><button className="icon-button" aria-label="Help"><CircleHelp size={17}/></button><button className="avatar" aria-label="Profile">A</button></div>
    </header>

    <section className="hero">
      <div className="hero__copy">
        <div className="eyebrow"><span className="eyebrow__line" /> DESIGN SYSTEM · V1.0</div>
        <h1>{isAstra ? <>Precision for<br/><em>the impossible.</em></> : <>An intelligence<br/>that feels <em>limitless.</em></>}</h1>
        <p className="hero__description">{isAstra ? 'A dedicated development environment shaped by celestial geometry, focused tooling and deliberate motion.' : 'A calm, premium workspace for thought, creation and discovery — built around the approved BRAHMA visual language.'}</p>
        <div className="hero__actions"><button className="primary-button" onClick={() => document.getElementById('foundation')?.scrollIntoView({ behavior: 'smooth' })}>Explore foundation <ArrowUpRight size={16}/></button><button className="quiet-button" onClick={copyToken}>{copied ? <Check size={15}/> : <Command size={15}/>} {copied ? 'Tokens copied' : 'Copy palette'}</button></div>
        <div className="hero__meta"><span><ShieldCheck size={14}/> Approved identity locked</span><span><Zap size={14}/> Reduced-motion ready</span></div>
      </div>
      <div className="hero__visual"><div className="visual-caption visual-caption--top"><span>CORE / 001</span><span>● ONLINE</span></div><Orb/><div className="visual-caption visual-caption--bottom"><span>AMBIENT INTELLIGENCE</span><span>v1.0.0</span></div></div>
    </section>

    <section className="product-switcher" aria-label="Product theme preview">
      <button className={!isAstra ? 'product-option is-active' : 'product-option'} onClick={() => setProduct('brahma')}><img src="/brand/brahma-mark.svg" alt=""/><span><strong>BRAHMA</strong><small>Intelligence platform</small></span><ChevronRight size={17}/></button>
      <div className="switcher-divider" />
      <button className={isAstra ? 'product-option is-active product-option--astra' : 'product-option product-option--astra'} onClick={() => setProduct('astra')}><img src="/brand/astra-mark.svg" alt=""/><span><strong>ASTRA</strong><small>Code · Create · Deploy</small></span><ChevronRight size={17}/></button>
    </section>

    <section className="foundation-section" id="foundation">
      <div className="section-heading"><div><div className="eyebrow">THE FOUNDATION</div><h2>Designed with intention.</h2></div><span className="section-note">CORE PRINCIPLES / 03</span></div>
      <div className="feature-grid">{features.map((feature, i) => { const Icon = feature.icon; return <article className="feature-card glass-surface" key={feature.title}><div className="feature-card__top"><span className="feature-icon"><Icon size={19}/></span><span className="feature-index">0{i+1}</span></div><h3>{feature.title}</h3><p>{feature.text}</p><div className="feature-line"><span style={{width: `${76+i*8}%`}} /></div></article>; })}</div>
    </section>

    <section className="palette-section glass-surface">
      <div className="palette-copy"><div className="eyebrow">TOKEN SOURCE OF TRUTH</div><h3>{isAstra ? 'ASTRA chromatic system' : 'BRAHMA chromatic system'}</h3><p>One shared source of truth for every surface, interaction and product state. These values are the approved v1 palette.</p><button className="text-button" onClick={copyToken}>{copied ? 'Copied to clipboard' : 'Copy core palette'} <ArrowUpRight size={14}/></button></div>
      <div className="swatches">{(isAstra ? [{n:'Void',c:'#070A18'},{n:'Surface',c:'#0D1428'},{n:'Panel',c:'#101B35'},{n:'Violet',c:'#8B5CF6'},{n:'Electric',c:'#38BDF8'},{n:'Cyan',c:'#22D3EE'}] : [{n:'Base',c:'#0B0F1A'},{n:'Elevated',c:'#111827'},{n:'Card',c:'#1E1B3D'},{n:'Gold',c:'#F6C87A'},{n:'Violet',c:'#8B5CF6'},{n:'Cyan',c:'#06B6D4'}]).map(s => <button className="swatch" key={s.n} onClick={async () => { try { await navigator.clipboard.writeText(s.c); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } catch {} }} title={`Copy ${s.c}`}><span style={{background:s.c}}/><strong>{s.n}</strong><code>{s.c}</code></button>)}</div>
    </section>

    <footer className="footer"><Brand astra={false}/><span>Built with clarity. Crafted for depth.</span><span className="footer__status"><i/> Design foundation preview</span></footer>
  </main>;
}
