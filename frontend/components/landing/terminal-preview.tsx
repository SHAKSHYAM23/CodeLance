'use client';

export function TerminalPreview() {
  return (
    <section className="py-24 px-4 bg-[#161b22]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-lg text-[#8b949e]">
            Here's how CodeAtlas works for you
          </p>
        </div>

        {/* Terminal Window */}
        <div className="rounded-lg border border-[#30363d] bg-[#0f1118] overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
            <div className="w-3 h-3 rounded-full bg-[#f85149]" />
            <div className="w-3 h-3 rounded-full bg-[#d29922]" />
            <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
            <span className="ml-4 text-sm text-[#8b949e]">
              codeatlas@ai:~$
            </span>
          </div>

          {/* Terminal Content */}
          <div className="p-6 font-mono text-sm">
            <div className="space-y-4">
              {/* Command 1 */}
              <div>
                <div className="text-[#8b949e]">
                  <span className="text-[#58a6ff]">$</span> add-repo
                  <span className="text-[#79c0ff]">
                    {' '}
                    https://github.com/vercel/next.js
                  </span>
                </div>
                <div className="mt-2 text-[#3fb950]">
                  ✓ Repository added successfully
                </div>
                <div className="text-[#8b949e]">
                  Processing 2,847 files...
                </div>
              </div>

              {/* Command 2 */}
              <div className="mt-6">
                <div className="text-[#8b949e]">
                  <span className="text-[#58a6ff]">$</span> ask
                  <span className="text-[#79c0ff]">
                    {' '}
                    &quot;How does the App Router work?&quot;
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="text-[#d2a8ff]">
                    Searching repositories...
                  </div>
                  <div className="text-[#56d4dd]">
                    Retrieving relevant files...
                  </div>
                  <div className="text-[#58a6ff]">
                    Analyzing code patterns...
                  </div>
                  <div className="text-[#3fb950]">
                    Synthesizing response...
                  </div>
                </div>
              </div>

              {/* Response */}
              <div className="mt-6 p-4 bg-[#21262d] rounded border border-[#30363d]">
                <div className="text-[#79c0ff] mb-2">The App Router is...</div>
                <div className="text-[#8b949e] text-xs">
                  📍 app/lib/render.ts:42-58
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
