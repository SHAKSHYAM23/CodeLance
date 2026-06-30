import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { TerminalPreview } from "@/components/landing/terminal-preview";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <TerminalPreview />

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-[#30363d] bg-[#0d1117] py-24 px-4">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-violet-500/20 blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-sm text-blue-400">
            Agentic RAG • Semantic Search • Repository Intelligence
          </span>

          <h2 className="mt-8 text-5xl md:text-6xl font-extrabold tracking-tight">
            Ask Better Questions.
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-[#9ca3af]">
            CodeLance understands your repository beyond simple code search.
            Explore architecture, implementation details, design decisions, and
            engineering trade-offs through natural conversation.
          </p>

          {/* Example Questions */}
          <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-[#30363d] bg-[#161b22]/80 p-6 backdrop-blur">
            <div className="space-y-4 text-left">

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-blue-400">
                💬 How does authentication work?
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-blue-400">
                💬 Why was PostgreSQL chosen instead of MongoDB?
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-blue-400">
                💬 What happens if we replace JWT with Sessions?
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-blue-400">
                💬 Explain the complete request flow.
              </div>

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] px-4 py-3 text-blue-400">
                💬 How would you improve this architecture?
              </div>

            </div>
          </div>

          {/* Keep your existing Get Started button here */}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d] bg-[#0d1117] py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">

          <h3 className="text-3xl font-bold text-white">
            CodeAtlas
          </h3>

          <p className="mt-3 text-[#8b949e]">
            Agentic RAG • Semantic Search • Repository Intelligence
          </p>

          <div className="mt-8 border-t border-[#30363d] pt-6">
            <p className="text-[#8b949e]">
              Built with{" "}
              <span className="text-red-500">❤️</span>{" "}
              by{" "}
              <span className="font-semibold text-white">
                Shakshyam Pandey
              </span>{" "}
              •{" "}
              <a
                href="https://github.com/SHAKSHYAM23"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                github.com/SHAKSHYAM23
              </a>
            </p>

            <p className="mt-3 text-sm text-[#6e7681]">
              © 2026 CodeAtlas. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}