import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientProvider } from "./contexts/ClientContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Clientes from "./pages/Clientes";
import Importar from "./pages/Importar";
import Viagem from "./pages/Viagem";
import Exportar from "./pages/Exportar";
import Stats from "./pages/Stats";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/cadastro"} component={Cadastro} />
      <Route path={"/clientes"} component={Clientes} />
      <Route path={"/importar"} component={Importar} />
      <Route path={"/viagem"} component={Viagem} />
      <Route path={"/exportar"} component={Exportar} />
      <Route path={"/stats"} component={Stats} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <ClientProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
