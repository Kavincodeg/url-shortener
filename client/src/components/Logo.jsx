import { useTheme } from '../../context/ThemeContext';

const Logo = ({ height = 32, style = {} }) => {
  const { theme } = useTheme();
  return (
    <img
      src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
      alt="Linko"
      style={{ height, objectFit: 'contain', ...style }}
    />
  );
};

export default Logo;
