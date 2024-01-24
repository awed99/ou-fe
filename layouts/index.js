import Auth from './auth';
import AuthAdmin from './auth_admin';
import Blank from './blank';
import Dashboard from './dashboard';
import DashboardAdmin from './dashboard_admin';
import Wizzard from './wizzard';

const Layout = ({children, type}) => {
    
    return(<>
        {
            (type === 'auth') && <Auth>{children}</Auth>
        }
        {
            (type === 'auth_admin') && <AuthAdmin>{children}</AuthAdmin>
        }
        {
            (type === 'blank') && <Blank>{children}</Blank>
        }
        {
            (type === 'wizzard') && <Wizzard>{children}</Wizzard>
        }
        {
            (type === 'dashboard') && <Dashboard>{children}</Dashboard>
        }
        {
            (type === 'dashboard_admin') && <DashboardAdmin>{children}</DashboardAdmin>
        }
    </>)
}

export default Layout