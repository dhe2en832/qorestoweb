import React, { Suspense } from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import ProgressLoader from '../../components/ProgressLoader';
import BSOList from './views/bso_list';
import BSOListFast from './views/bso_list_fast';
import BSOForm from './views/bso_form';

export default function BSO() {
  const { path } = useRouteMatch();
  return (
    <>
      <Suspense fallback={<ProgressLoader />}>
        <Switch>
          <Route exact path={path} component={BSOList} />
          <Route exact path={`${path}/add`} component={() => <BSOForm mode="add" />} />
          <Route exact path={`${path}/edit/:id`} component={() => <BSOForm mode="edit" />} />
          <Route exact path={`${path}/fast`} component={BSOListFast} />
          <Route exact path={`${path}/fast/add`} component={() => <BSOForm mode="add" />} />
          <Route exact path={`${path}/fast/edit/:id`} component={() => <BSOForm mode="edit" />} />
          <Redirect from="*" to="/404" />
        </Switch>
      </Suspense>
    </>
  );
}
