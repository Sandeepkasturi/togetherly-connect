
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Header = () => (
  <motion.header
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-4 border-b border-border flex justify-between items-center"
  >
    <Link to="/" className="text-2xl font-bold text-primary no-underline hover:opacity-80 transition-opacity">
      Togetherly
    </Link>
  </motion.header>
);

export default Header;
