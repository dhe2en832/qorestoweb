import React, { Suspense } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BSALESPList from './views/bsalesp_list';

export default function BSALESP() {
  const { path } = useRouteMatch();
  return (
    <>
      <Suspense fallback={<ProgressLoader />}>
        <Switch>
          <Route exact path={path} component={BSALESPList} />
          <Redirect from="*" to="/404" />
        </Switch>
      </Suspense>
    </>
  );
}
