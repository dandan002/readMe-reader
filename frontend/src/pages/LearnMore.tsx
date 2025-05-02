import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const LearnMore = () => {
  return (  
    <div className="min-h-screen bg-blue-50">
      <Navigation />
      
      <main className="pt-16 container mx-auto px-4 py-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-6 mt-12 text-black">Learn More About Us</h1>
          <p className="text-black max-w-2xl mx-auto">
            Discover the features, mission, and vision behind readMe.
          </p>
          
          <div className="mt-12 space-y-8 max-w-3xl mx-auto">
            <div className="bg-white shadow-md rounded-lg p-8 border border-blue-100 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4 text-black">Our Mission</h2>
              <p className="text-black">
                We're committed to providing a simple platform for reading foreign text.
              </p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-8 border border-blue-100 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4 text-black">Key Features</h2>
              <ul className="text-black space-y-3 list-disc list-inside">
                <li>Wide choice of LLMs</li>
                <li>Support for .docx, .txt, .epub, copy/paste</li>
                <li>Seamless user experience</li>
              </ul>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-8 border border-blue-100 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-4 text-black">Contact Us</h2>
              <p className="text-black mb-4">
                Have questions? We're here to help.
              </p>
              <button className="px-6 py-2 bg-blue-200 text-black rounded-full hover:bg-blue-300 transition-colors">
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