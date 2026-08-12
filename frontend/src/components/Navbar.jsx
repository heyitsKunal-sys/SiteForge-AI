import { useNavigate } from 'react-router-dom';
import { navbarStyles as s } from '../assets/dummyStyles'
import { Logo } from '../assets/ui'
import { Zap, Settings } from 'lucide-react'

const links = [
    { label: "Home", to: "/" },
    { label: "My Projects", to: "/dashboard", protected: true },
    { label: "Community", to: "/community" },
    { label: "Pricing", to: "/pricing" },
];
const accountLinks = [
    { label: "Buy credits", icon: Zap, to: "/pricing", iconClass: s.accountIconIndigo },
    { label: "Settings", icon: Settings, to: "/settings" },
];
const Navbar = () => {
    const navigate  = useNavigate()
    return (
        <nav className={s.root}>
            <div className={s.container}>
                <Logo />
                <div className={s.centerLinks}>


                </div>
            </div>

        </nav>
    )
}

export default Navbar