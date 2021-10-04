import React, { Suspense } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BSTOCKList from './views/bstock_list';

export default function BSTOCK() {
  const { path } = useRouteMatch();
  return (
    <>
      <Suspense fallback={<ProgressLoader />}>
        <Switch>
          <Route exact path={path} component={BSTOCKList} />
          <Redirect from="*" to="/404" />
        </Switch>
      </Suspense>
    </>
  );
}
