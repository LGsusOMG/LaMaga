import './App.scss';
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Home, CategoryProduct, Search } from "./pages/index";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Footer from "./components/Footer/Footer";
import store from "./store/store";
import { Provider } from "react-redux";
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AdminProducts from './pages/AdminProducts/AdminProducts';
import AdminCategories from './pages/AdminCategories/AdminCategories';

import SingleProduct from './pages/SingleProduct/SingleProduct';
import AllProductsPage from './pages/AllProductsPage/AllProductsPage';

function Layout() {
  const location = useLocation();
  // Definimos rutas donde no queremos mostrar Header, Sidebar ni Footer
  const noLayoutRoutes = ['/admin/login', '/admin/dashboard', '/admin/products', '/admin/categories'];

  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowLayout && <Header />}
      {shouldShowLayout && <Sidebar />}
      <Routes>
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/category/:category" element={<ErrorBoundary><CategoryProduct /></ErrorBoundary>} />
        <Route path="/search/:searchTerm" element={<ErrorBoundary><Search /></ErrorBoundary>} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />

        <Route path="/product/:id" element={<ErrorBoundary><SingleProduct /></ErrorBoundary>} />
        <Route path="/products" element={<ErrorBoundary><AllProductsPage /></ErrorBoundary>} />
      </Routes>
      {shouldShowLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </div>
  );
}

export default App;
