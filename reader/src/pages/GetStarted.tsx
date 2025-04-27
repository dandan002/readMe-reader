
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "../index.css";


const GetStarted = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background align-center">
      <Navigation />
      
      <main className="flex grow pt-16 items-center justify-center container mx-auto px-4 py-12 ">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-6 mt-12 text-[#60A5FA] animate-slide-down" >Get Started</h1>
          <p className="text-secondary max-w-2xl mx-auto animate-slide-down">
            Ready to begin? Launch the app below!
          </p>
          
          <div className="mt-12 space-y-6 max-w-md mx-auto animate-slide-down">
            <div className="bg-white shadow-md rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">Launch App</h2>
              <p className="text-secondary mb-4">
              Try out the reader now!
              </p>
              <button className="bg-[#60A5FA] w-full px-4 py-2 bg-primary text-white rounded-full hover:bg-blue-500 "
                onClick={() => window.location.href = "/reader"}>
              Launch Reader
              </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">App coming soon!</h2>
              <div className="flex space-x-4 justify-center">
                <button className="bg-[#60A5FA] px-4 py-2  text-white rounded-full hover:bg-blue-500">
                  App Store
                </button>
                <button className="bg-[#60A5FA] px-4 py-2  text-white rounded-full hover:bg-blue-500">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </section>
            </main>
      <div className="margin-bottom:0px"><Footer/></div>
      
    </div>
  );
};

export default GetStarted;
