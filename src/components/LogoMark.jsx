import logo from '../assets/logo.png';

export function LogoMark({ className, style }) {
  return <img src={logo} alt="Al-Bayan" className={'logomark ' + (className || '')} style={style} />;
}
