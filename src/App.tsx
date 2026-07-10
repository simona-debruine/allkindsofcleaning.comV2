import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import Navbar from "./components/feature/Navbar";
import Footer from "./components/feature/Footer";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <Navbar />
        <AppRoutes />
        <Footer />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;