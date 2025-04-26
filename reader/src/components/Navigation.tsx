
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">
          readMe
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            Get Started
          </Button>
          <Button className="text-white">
            Learn More
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
