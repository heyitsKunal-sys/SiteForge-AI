import { NavLink, useNavigate, Link } from 'react-router-dom';
import { navbarStyles as s } from '../assets/dummyStyles'
import { Logo } from '../assets/ui'
import { Zap, Settings } from 'lucide-react'
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

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
    const navigate = useNavigate()
    const { user, logoutUser } = useAuth();
    const isAuthed = Boolean(user);
    const [open, setOpen] = useState(false);
    const visibleLinks = links.filter((l) => !l.protected || isAuthed)
    return (
        <nav className={s.root}>
            <div className={s.container}>
                <Logo />
                <div className={s.centerLinks}>
                    {visibleLinks.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === '/'}
                            className={({ isActive }) =>
                                `${s.navLinkBase} ${isActive ? s.navLinkActive : s.navLinkInactive}`
                            }
                        >
                            {l.label}

                        </NavLink>
                    ))}


                </div>
                <div className={s.desktopRight}>
                    {isAuthed ? (
                        <UserMenu />
                    ) : (
                        <>
                            <Link to='/login' className={s.signInLink}>
                               <Button>
                                Sign In
                                </Button> 

                            </Link>
                            <Button onClick={()=> navigate('/register')}
                                className={`${s.btnPrimary} text-[13px] px-4 py-2`}>
                                    Get Started

                            </Button>
                        </>
                    )}

                </div>
            </div>

        </nav>
    )
}

export default Navbar