
import { motion } from 'framer-motion';

const Header = () => (
  <motion.header
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-4 border-b border-border"
  >
    <h1 className="text-2xl font-bold text-primary">Togetherly</h1>
  </motion.header>
);

export default Header;
