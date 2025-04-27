import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-14 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm">
            © 2024 readMe. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="https://www.linkedin.com/in/danieljung010/" className="text-white/70 hover:text-white transition-colors">
              LinkedIn
            </Link>
            <Link to="https://www.github.com/dandan002/" className="text-white/70 hover:text-white transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;