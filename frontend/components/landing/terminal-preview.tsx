'use client';

import Image from 'next/image';

export function TerminalPreview() {
  return (
    <section className="py-24 px-4 bg-[#161b22]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See it in action
          </h2>
          <p className="text-lg text-[#8b949e]">
            A real question, asked against a real codebase — no scripted demo
          </p>
        </div>

        {/* Window frame */}
        <div className="rounded-lg border border-[#30363d] bg-[#0f1118] overflow-hidden shadow-2xl">
          {/* Window header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
            <div className="w-3 h-3 rounded-full bg-[#f85149]" />
            <div className="w-3 h-3 rounded-full bg-[#d29922]" />
            <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
            <span className="ml-4 text-sm text-[#8b949e]">
              CodeLance.app — SHAKSHYAM23/TicketFlow
            </span>
          </div>

          {/* Screenshot */}
          <div className="relative w-full aspect-1859/868">
            <Image
              src="/screenshots/ticketflow-demo.png"
              alt="CodeLance answering a question about the TicketFlow repository, showing the agent's cited sources"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 1152px"
              priority
            />
          </div>
        </div>

        {/* Caption row under the screenshot */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-[#3fb950] font-mono mb-1">01</div>
            <p className="text-[#8b949e]">
              Every repo is parsed into chunks first — this one, 78 files
              down to 253 searchable pieces.
            </p>
          </div>
          <div>
            <div className="text-[#3fb950] font-mono mb-1">02</div>
            <p className="text-[#8b949e]">
              The agent decides which tools to call based on the question,
              not a fixed retrieval step.
            </p>
          </div>
          <div>
            <div className="text-[#3fb950] font-mono mb-1">03</div>
            <p className="text-[#8b949e]">
              Answers stay grounded in the actual code — no filler, no
              guessing when something isn't there.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
