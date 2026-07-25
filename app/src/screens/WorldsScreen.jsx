import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconArrowRight,
  IconBolt,
  IconCompass,
  IconHeart,
  IconTrendUp,
} from '../components/icons.jsx';
import { WorldWorkspace, WORLD_NOTEBOOKS } from '../components/WorldWorkspace.jsx';

const WORLDS = [
  {
    id: 'move',
    number: '01',
    title: 'Move',
    subtitle: 'Skill · power · longevity',
    copy: 'Your evolving movement practice—from the next line to the athlete you are becoming.',
    color: '#42E0B1',
    Icon: IconBolt,
    go: 'perform',
  },
  {
    id: 'build',
    number: '02',
    title: 'Build',
    subtitle: 'Podium · craft · freedom',
    copy: 'Turn ideas into real leverage without building another life that owns you.',
    color: '#FFB250',
    Icon: IconTrendUp,
    go: 'build',
  },
  {
    id: 'life',
    number: '03',
    title: 'Belong',
    subtitle: 'Chelsea · people · home',
    copy: 'Protect the relationships and moments that make the ambition worth carrying.',
    color: '#FF74A9',
    Icon: IconHeart,
    go: 'map',
  },
  {
    id: 'explore',
    number: '04',
    title: 'Explore',
    subtitle: 'Travel · wonder · possibility',
    copy: 'Keep the horizon open. Plan less life around obligation and more around aliveness.',
    color: '#7D8CFF',
    Icon: IconCompass,
    go: 'map',
  },
];

function WorldNotebooks() {
  const [activeDomain, setActiveDomain] = useState('podium');
  const active = WORLD_NOTEBOOKS.find((item) => item.domain === activeDomain) || WORLD_NOTEBOOKS[0];

  return (
    <section className="world-notebooks" aria-label="World notes and projects">
      <header className="world-notebooks__intro">
        <div className="living-kicker">YOUR WORK, WITH A PLACE TO LIVE</div>
        <h2>Ideas become worlds.</h2>
        <p>
          Drop a thought before it disappears. Turn it into a project when it is ready,
          then let JAM carry the next move into your day.
        </p>
      </header>

      <div className="world-notebooks__rail" role="tablist" aria-label="Choose a world workspace">
        {WORLD_NOTEBOOKS.map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={active.domain === item.domain}
            className={active.domain === item.domain ? 'is-active' : ''}
            style={{ '--notebook-color': item.color }}
            onClick={() => setActiveDomain(item.domain)}
            key={item.domain}
          >
            {item.label}
          </button>
        ))}
      </div>

      <WorldWorkspace
        key={active.domain}
        {...active}
        heading="Notes & projects"
        description={`Ideas, plans, and active work that belong to ${active.label}.`}
      />
    </section>
  );
}

export function WorldsScreen({ onGoTab }) {
  return (
    <main className="worlds-screen">
      <header className="worlds-header">
        <div className="living-kicker">YOUR LIFE, AS WORLDS</div>
        <h1>Choose where<br />to enter.</h1>
        <p>No folders. No departments. Just the parts of your life that are alive right now.</p>
      </header>

      <section className="world-river">
        {WORLDS.map((world, index) => (
          <motion.button
            key={world.id}
            className={`world-panel world-panel--${world.id}`}
            style={{ '--world-color': world.color }}
            onClick={() => onGoTab?.(world.go)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.45 }}
            whileTap={{ scale: 0.985 }}
          >
            <span className="world-panel__number">{world.number}</span>
            <world.Icon size={28} />
            <div>
              <span className="world-panel__subtitle">{world.subtitle}</span>
              <h2>{world.title}</h2>
              <p>{world.copy}</p>
            </div>
            <span className="world-panel__enter">Enter <IconArrowRight size={14} /></span>
          </motion.button>
        ))}
      </section>

      <WorldNotebooks />
    </main>
  );
}
