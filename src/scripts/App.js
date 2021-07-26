import React, { Suspense } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <p>CSA Computer</p>
    </div>
  );
};

const NotFound = () => {
  return (
    <div>
      <p>404. Halaman Tidak Ditemukan</p>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter basename="/researchCSA">
      <Suspense fallback={'Sedang Memuat...'}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/404" component={NotFound} />
          <Redirect from="*" to="/404" />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}
 