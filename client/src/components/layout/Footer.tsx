import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <span className="hidden sm:inline">·</span>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
