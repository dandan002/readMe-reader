import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main content with top padding for navigation */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-24 sm:py-30">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-primary mb-6">
              Change how you understand
              <br />
              <span className="bg-gradient-to-r from-[#ADD8E6] to-[#90D5FF] bg-clip-text text-transparent">
                language
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-secondary mb-8">
              Translate as you read. Context changes everything. 
            </p>
            <div className="flex justify-center gap-4">
                <button
                className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                onClick={() => window.location.href = "/get-started"}>
                Get Started
                </button>
              <button className="px-6 py-3 glass rounded-full hover:bg-white/20 transition-colors flex items-center gap-2"
                onClick={() => window.location.href = "/learn-more"}>
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-16">Features designed for learners</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Translation",
                  description: "See translations as you highlight",
                  icon: "{}",
                },
                {
                  title: "Contextualization",
                  description: "See examples of usage in different contexts",
                  icon: "📚",
                },
                {
                  title: "(Almost) Universal Language Support",
                  description: "Find translations for almost any language",
                  icon: "🌐",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-colors"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How secure is my data?",
                  answer: "We wanted to encrypt everything but we didn't have time.",
                },
                {
                  question: "What are the fees?",
                  answer: "We're on free plans for Google Gemini and Groq.",
                },
                {
                  question: "How do I get started?",
                  answer: "Click on Get Started! (We didn't bother with authentication yet)",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-background/50"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeAccordion === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === index && (
                    <div className="px-6 py-4 bg-background/50">
                      <p className="text-secondary">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-8">Ready to begin?</h2>
            <button className="px-8 py-4 bg-accent text-primary rounded-full font-semibold hover:bg-accent/90 transition-colors">
              Get Started
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
