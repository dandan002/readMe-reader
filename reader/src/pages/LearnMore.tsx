import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16 container mx-auto px-4 py-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-6 mt-12 text-primary">Learn More About Us</h1>
          <p className="text-secondary max-w-2xl mx-auto">
            Discover the features, mission, and vision behind our innovative application.
          </p>
          
          <div className="mt-12 space-y-8 max-w-3xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-secondary">
                We're committed to providing simple, secure, and intuitive solutions that empower users in their financial journey.
              </p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
              <ul className="text-secondary space-y-3 list-disc list-inside">
                <li>Bank-grade security</li>
                <li>Real-time transaction monitoring</li>
                <li>AI-powered financial insights</li>
                <li>Seamless user experience</li>
              </ul>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-secondary mb-4">
                Have questions? We're here to help.
              </p>
              <button className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                Get in Touch
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LearnMore;
