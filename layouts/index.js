import Auth from './auth';
import AuthAdmin from './auth_admin';
import Blank from './blank';
import Dashboard from './dashboard';
import DashboardAdmin from './dashboard_admin';
import Wizzard from './wizzard';

const Layout = ({children, type, listCountries=false}) => {
    
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
            (type === 'dashboard') && <Dashboard listCountries={listCountries}>{children}</Dashboard>
        }
        {
            (type === 'dashboard_admin') && <DashboardAdmin listCountries={listCountries}>{children}</DashboardAdmin>
        }
    </>)
}

export default Layout