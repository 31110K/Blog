import { MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import "./cssfile/footer.css";

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="footer-left">
        <div className="footer-item">
          <MapPin size={16} />
          <div>
            <p className="footer-label">21  Street</p>
            <p className="footer-value bold">abc, efgh</p>
          </div>
        </div>

        <div className="footer-item">
          <Phone size={16} />
          <p className="footer-value bold">+91 9555 123 456</p>
        </div>

        <div className="footer-item">
          <Mail size={16} />
          <p className="footer-value link">31110ky@gmail.com</p>
        </div>
      </div>

      <div className="footer-right">
        <p className="footer-heading">About the company</p>
        <p className="footer-description">
          this blogging website is a platform where stories come to life. Whether it's thoughts, 
          experiences, or creative expressions, we provide a space for writers to share, connect,
          and inspire. Our goal is to make blogging simple, beautiful, and accessible for everyone -
          because every voice deserves to be heard.
        </p>
        <div className="footer-socials">
          <a href="https://facebook.com" className="footer-icon footer-facebook" target="_blank" rel="noopener noreferrer"><Facebook size={14} /></a>
          <a href="https://twitter.com" className="footer-icon footer-twitter" target="_blank" rel="noopener noreferrer"><Twitter size={14} /></a>
          <a href="https://linkedin.com" className="footer-icon footer-linkedin" target="_blank" rel="noopener noreferrer"><Linkedin size={14} /></a>
          <a href="https://github.com" className="footer-icon footer-github" target="_blank" rel="noopener noreferrer"><Github size={14} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;