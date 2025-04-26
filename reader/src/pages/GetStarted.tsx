
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16 container mx-auto px-4 py-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-6 mt-12 text-primary">Get Started</h1>
          <p className="text-secondary max-w-2xl mx-auto">
            Ready to begin? Launch the app below!
          </p>
          
          <div className="mt-12 space-y-6 max-w-md mx-auto">
            <div className="bg-white shadow-md rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Launch App</h2>
              <p className="text-secondary mb-4">
              Try out the reader now!
              </p>
              <button className="w-full px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                onClick={() => window.location.href = "/reader"}>
              Launch Reader
              </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">App coming soon!</h2>
              <div className="flex space-x-4 justify-center">
                <button className="px-4 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors">
                  App Store
                </button>
                <button className="px-4 py-2 bg-secondary text-white rounded-full hover:bg-secondary/90 transition-colors">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </section>
            </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
