import { getLifeMapScores, getFile, listFiles, getAnalyticsData, getRandomWisdom } from '@/lib/api';
import LifeMapRadar from './components/LifeMapRadar';
import EnergyChart from './components/EnergyChart';
import Heatmap from './components/Heatmap';
import WisdomWidget from './components/WisdomWidget';
import MementoMori from './components/MementoMori';
import DailyCycleWidget from './components/DailyCycleWidget';
import Link from 'next/link';
import { ArrowRight, Zap, Target, ArrowUpRight, Flame, Layers, Power } from 'lucide-react';

export default async function Home() {
  const scores = getLifeMapScores();
  const northStar = getFile('north_star.md');
  const recentDailies = listFiles('reviews/daily')
    .filter(f => !f.name.includes('template'))
    .slice(0, 3);
  const analytics = getAnalyticsData();
  const wisdom = getRandomWisdom();

  // Extract Mission
  let mission = "Define your mission in north_star.md";
  if (northStar) {
    const match = northStar.content.match(/## Core Mission statement\n\*(.*)\*/);
    if (match) mission = match[1];
    else {
      const lines = northStar.content.split('\n');
      const index = lines.findIndex(l => l.includes('Core Mission statement'));
      if (index !== -1 && lines[index + 2]) mission = lines[index + 2];
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <section className="flex justify-between items-end pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-bold mb-2">System Online</p>
          <h1 className="text-5xl font-serif font-bold tracking-tight mb-4">Good Morning, CEO.</h1>
          <p className="text-[var(--muted)] text-xl font-light italic max-w-2xl">
            "{mission.replace(/\[WRITE HERE\]/g, 'Building the future...')}"
          </p>
        </div>
        <div className="glass-card px-6 py-4 flex flex-col gap-2 border border-[var(--accent)]/20 min-w-[180px]">
          <div className="text-[10px] font-bold uppercase text-[var(--muted)] tracking-widest">Energy Trend</div>
          <div className="flex items-end justify-between gap-4">
            <div className="h-12 flex-1">
              <EnergyChart data={analytics.energyTrend} />
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-[var(--accent)]">
                {analytics.energyTrend[analytics.energyTrend.length - 1]?.energy || '-'}
              </span>
              <span className="text-xs text-[var(--muted)] ml-1">/10</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">

        {/* Left Col: Actions & Context */}
        <div className="col-span-8 space-y-6">
          <DailyCycleWidget />

          <div className="grid grid-cols-2 gap-6">
            <ActionCard
              title="Weekly Review"
              desc="Strategic Reset & Plan"
              href="/reviews/new?type=weekly"
              icon={<Layers className="text-[var(--fg)] w-6 h-6" />}
              delay={0.2}
            />
            <ActionCard
              title="Thinking Tools"
              desc="AI-Powered Decision Frameworks"
              href="/tools"
              icon={<Target className="text-[var(--accent)] w-6 h-6" />}
              delay={0.1}
            />
          </div>

          <div className="glass-card border-l-4 border-l-[var(--accent)] relative overflow-hidden">
            <WisdomWidget text={wisdom} />
          </div>

          <div className="glass-card">
            <h3 className="mb-6 font-serif font-bold text-lg">Recent Logs</h3>
            <div className="space-y-2">
              {recentDailies.map((file, i) => (
                <Link key={file.name} href={`/library/file?path=${encodeURIComponent(file.path)}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-[var(--border)]">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${file.energyLevel && file.energyLevel > 7 ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                    <span className="font-mono text-sm opacity-80">{file.slug}</span>
                  </div>
                  <span className="text-[var(--muted)] group-hover:text-[var(--accent)] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    View Entry <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-lg">Consistency Map</h3>
              <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">90 Day Lookback</span>
            </div>
            <Heatmap dates={analytics.dates} />
          </div>

          <MementoMori />
        </div>

        {/* Right Col: Signal */}
        <div className="col-span-4 space-y-6">
          <div className="glass-card h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
            <div className="flex items-center justify-between mb-4 z-10">
              <h3 className="font-serif font-bold text-lg">Life Map</h3>
              <Link href="/frameworks/life_map" className="btn-glass p-2">
                <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center -ml-4">
              <LifeMapRadar scores={scores} />
            </div>
          </div>

          <div className="glass-card bg-gradient-to-br from-[var(--glass-surface)] to-[var(--accent)]/10">
            <div className="flex items-center gap-3 mb-6 text-[var(--accent)]">
              <div className="p-2 glass rounded-lg"><Flame size={20} /></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--fg)]">Momentum</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end pb-2 border-b border-[var(--border)]/50">
                <span className="text-sm opacity-70">Current Streak</span>
                <span className="font-mono text-3xl font-bold">{analytics.streak} <span className="text-sm font-sans font-normal opacity-50">Days</span></span>
              </div>
              <div className="flex justify-between items-end pb-2">
                <span className="text-sm opacity-70">Quarter Progress</span>
                <span className="font-mono text-xl">34%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ActionCard({ title, desc, href, icon, delay }: any) {
  return (
    <Link href={href} className="glass-card group hover:scale-[1.02] active:scale-95 border border-[var(--glass-border)] hover:border-[var(--accent)]/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="mb-3 w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-bold group-hover:text-[var(--accent)] transition-colors">{title}</h3>
        <p className="text-[var(--muted)] text-sm mt-1">{desc}</p>
      </div>
    </Link>
  )
}
