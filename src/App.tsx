import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { Chatbot } from './components/Chatbot';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { StylistPage } from './pages/StylistPage';
import { TryOnPage } from './pages/TryOnPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

type Page = 'home' | 'shop' | 'stylist' | 'tryon' | 'login' | 'dashboard' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCheckout = () => {
    setIsCartOpen(false);
    alert('Checkout functionality would integrate with Stripe here!');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'shop':
        return <ShopPage />;
      case 'stylist':
        return <StylistPage />;
      case 'tryon':
        return <TryOnPage />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
            <Navbar
              onCartClick={() => setIsCartOpen(true)}
              currentPage={currentPage}
              onNavigate={setCurrentPage}
            />

            <main className="pt-16">{renderPage()}</main>

            <Footer />

            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onCheckout={handleCheckout}
            />

            <Chatbot />
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
