
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav >
      <div>
        <Link to="/" >
          readMe
        </Link>
        
        <div >
          <Button>
            Get Started
          </Button>
          <Button>
            Learn More
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
