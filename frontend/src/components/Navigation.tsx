
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">
          readMe
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex"
           onClick={() => window.location.href = "/learn-more"}>
            Learn More
          </Button>
          <Button className="text-white"
            onClick={() => window.location.href = "/get-started"}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
