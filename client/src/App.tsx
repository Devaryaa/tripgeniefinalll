import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TripProvider } from "./context/TripContext";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Itinerary from "./pages/Itinerary";
import PlanB from "./pages/PlanB";
import Nearby from "./pages/Nearby";
import Login from "./pages/loginpage";
import Account from "./pages/account";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/account" component={Account} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/itinerary" component={Itinerary} />
        <Route path="/plan-b" component={PlanB} />
        <Route path="/nearby" component={Nearby} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TripProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router />
        </TooltipProvider>
      </TripProvider>
    </QueryClientProvider>
  );
}
