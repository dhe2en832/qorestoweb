import React, { Suspense } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BSOForm from './views/bso_form';

export default function BSO() {
  const { path } = useRouteMatch();
  return (
    <>
      <Suspense fallback={<ProgressLoader />}>
        <Switch>
          <Route exact path={path} component={() => <BSOForm mode="add" />} />
          <Redirect from="*" to="/404" />
        </Switch>
      </Suspense>
    </>
  );
}
