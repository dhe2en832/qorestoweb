import React, { Suspense } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BCUSTList from './views/bcust_list';

export default function BCUST() {
  const { path } = useRouteMatch();
  return (
    <>
      <Suspense fallback={<ProgressLoader />}>
        <Switch>
          <Route exact path={path} component={BCUSTList} />
          <Redirect from="*" to="/404" />
        </Switch>
      </Suspense>
    </>
  );
}
