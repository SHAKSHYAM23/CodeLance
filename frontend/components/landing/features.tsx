'use client';

import {
  Search,
  BrainCircuit,
  Link2,
  Workflow,
  GitBranch,
  Languages,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: <Search className="w-7 h-7 text-[#60a5fa]" />,
    title: 'Intelligent Search',
    description:
      'Hybrid retrieval combining pgvector semantic search with PostgreSQL full-text search for precise repository understanding.',
  },
  {
    icon: <BrainCircuit className="w-7 h-7 text-[#60a5fa]" />,
    title: 'Code Analysis',
    description:
      'AI reconstructs repository context across multiple files to explain architecture, dependencies and implementation details.',
  },
  {
    icon: <Link2 className="w-7 h-7 text-[#60a5fa]" />,
    title: 'Source Citations',
    description:
      'Every answer is grounded with exact filenames, functions and line numbers so every explanation remains verifiable.',
  },
  {
    icon: <Workflow className="w-7 h-7 text-[#60a5fa]" />,
    title: 'Async Pipeline',
    description:
      'BullMQ-powered ingestion pipeline processes repositories reliably while respecting external API limits.',
  },
  {
    icon: <GitBranch className="w-7 h-7 text-[#60a5fa]" />,
    title: 'Agentic Reasoning',
    description:
      'Multi-step reasoning plans retrieval, ranking and synthesis before generating architecture-aware responses.',
  },
  {
    icon: <Languages className="w-7 h-7 text-[#60a5fa]" />,
    title: 'Language Agnostic',
    description:
      'Supports all major programming languages through a language-agnostic chunking strategy.',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden py-28 px-6"
    >
      {/* Background */}
      <div className="absolute inset-0 grid-background opacity-30" />
      <div className="absolute inset-0 gradient-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center rounded-full border border-[#2f81f7]/30 bg-[#0d1117]/80 backdrop-blur-xl px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-[#58a6ff] mr-3" />
            <span className="text-sm tracking-[0.2em] uppercase text-[#58a6ff]">
              Core Architecture
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-20">

          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Built for
            <span className="bg-linear-to-r from-[#58a6ff] via-[#7c8cff] to-[#4fd1ff] bg-clip-text text-transparent">
              {" "}Real Codebases
            </span>
          </h2>

          <p className="mt-8 max-w-3xl mx-auto text-lg leading-8 text-[#9ba3af]">
            Engineered with hybrid retrieval, semantic search, intelligent
            re-ranking and grounded citations to understand repositories
            beyond simple code search.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">

          {features.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-[#2f3640] bg-[#0d1117]/80 backdrop-blur-xl p-10 transition-all duration-500 hover:-translate-y-2 hover:border-[#58a6ff]/60 hover:shadow-[0_25px_80px_rgba(88,166,255,.15)]"
            >
              {/* Top Glow */}
              <div className="absolute left-0 top-0 h-0.5 w-full bg-linear-to-r from-transparent via-[#58a6ff] to-transparent opacity-0 transition group-hover:opacity-100" />

              {/* Icon */}
              <div className="relative mb-8">

                <div className="absolute inset-0 rounded-full bg-[#58a6ff]/20 blur-3xl opacity-0 transition group-hover:opacity-100" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2f81f7]/30 bg-[#0b1220] transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-5 leading-8 text-[16px] text-[#9ba3af]">
                {feature.description}
              </p>

              
              
            </div>
          ))}
                    {features.slice(3).map((feature, index) => (
            <div
              key={index + 3}
              className="group relative overflow-hidden rounded-3xl border border-[#2f3640] bg-[#0d1117]/80 backdrop-blur-xl p-10 transition-all duration-500 hover:-translate-y-2 hover:border-[#58a6ff]/60 hover:shadow-[0_25px_80px_rgba(88,166,255,.15)]"
            >
              {/* Top Glow */}
              <div className="absolute left-0 top-0 h-0.5 w-full bg-linear-to-r from-transparent via-[#58a6ff] to-transparent opacity-0 transition group-hover:opacity-100" />

              {/* Icon */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-[#58a6ff]/20 blur-3xl opacity-0 transition group-hover:opacity-100" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2f81f7]/30 bg-[#0b1220] transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-5 leading-8 text-[16px] text-[#9ba3af]">
                {feature.description}
              </p>

              {/* Bottom Link */}
             
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['Hybrid Retrieval', 'pgvector + PostgreSQL'],
            ['Agentic Workflow', 'Multi-step reasoning'],
            ['Grounded AI', 'Exact source citations'],
            ['Universal Support', 'All major languages'],
          ].map(([title, value]) => (
            <div
              key={title}
              className="rounded-2xl border border-[#2f3640] bg-[#0d1117]/60 backdrop-blur-xl p-6 text-center transition-all duration-300 hover:border-[#58a6ff]/40 hover:bg-[#111827]"
            >
              <p className="text-sm uppercase tracking-[0.15em] text-[#58a6ff]">
                {title}
              </p>

              <p className="mt-3 text-white font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}